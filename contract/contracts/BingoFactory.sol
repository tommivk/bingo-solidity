// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./Bingo.sol";
import "./interfaces/VRFCoordinatorV2Interface.sol";
import "./interfaces/LinkTokenInterface.sol";
import "./AutomationCompatible.sol";

contract BingoFactory is AutomationCompatible {
    VRFCoordinatorV2Interface COORDINATOR;
    LinkTokenInterface LINKTOKEN;

    address vrfCoordinator;
    address linkTokenContract;
    bytes32 keyHash;
    uint64 public vrfSubscriptionId;

    address public owner;
    Bingo[] contracts;

    uint public gameFee;

    event NewRoomCreated(
        address indexed _creator,
        address indexed _contractAddress,
        uint _ticketCost,
        uint8 _minPlayers,
        uint8 _maxPlayers
    );
    event OwnerChanged(address indexed _newOwner);

    constructor(
        address _owner,
        uint _gameFee,
        address _vrfCoordinator,
        address _linkTokenContract,
        bytes32 _keyHash
    ) {
        owner = _owner;
        gameFee = _gameFee;
        vrfCoordinator = _vrfCoordinator;
        linkTokenContract = _linkTokenContract;
        keyHash = _keyHash;
        COORDINATOR = VRFCoordinatorV2Interface(vrfCoordinator);
        LINKTOKEN = LinkTokenInterface(linkTokenContract);
        vrfSubscriptionId = COORDINATOR.createSubscription();
    }

    function createRoom(
        uint _ticketCost,
        uint8 _minPlayers,
        uint8 _maxPlayers
    ) public payable {
        Bingo bingo = new Bingo{value: msg.value}(
            msg.sender,
            _ticketCost,
            gameFee,
            _minPlayers,
            _maxPlayers,
            vrfCoordinator,
            vrfSubscriptionId,
            keyHash
        );
        contracts.push(bingo);
        addVRFConsumer(address(bingo));
        emit NewRoomCreated(
            msg.sender,
            address(bingo),
            _ticketCost,
            _minPlayers,
            _maxPlayers
        );
    }

    function getContracts() public view returns (Bingo[] memory) {
        return contracts;
    }

    function addVRFConsumer(address _address) private {
        COORDINATOR.addConsumer(vrfSubscriptionId, _address);
    }

    receive() external payable {}

    modifier onlyOwner() {
        require(
            msg.sender == owner,
            "Only contract owner can call this function"
        );
        _;
    }

    function withdraw() external onlyOwner {
        (bool success, ) = payable(owner).call{value: address(this).balance}(
            ""
        );
        require(success, "Failed to withdraw");
    }

    function changeOwner(address _owner) public onlyOwner {
        owner = _owner;
        emit OwnerChanged(_owner);
    }

    function changeGameFee(uint _newFee) external onlyOwner {
        gameFee = _newFee;
    }

    // 1000000000000000000 = 1 LINK
    function topUpSubscription(uint256 amount) external onlyOwner {
        LINKTOKEN.transferAndCall(
            address(COORDINATOR),
            amount,
            abi.encode(vrfSubscriptionId)
        );
    }

    function checkUpkeep(
        bytes calldata /* checkData */
    )
        external
        view
        override
        returns (bool upkeepNeeded, bytes memory performData)
    {
        uint[] memory runningGames = new uint[](contracts.length);
        uint totalRunning = 0;

        for (uint i = 0; i < contracts.length; i++) {
            Bingo bingo = Bingo(contracts[i]);
            if (bingo.canDrawNumber()) {
                runningGames[totalRunning] = i;
                totalRunning++;
            }
        }

        if (totalRunning > 0) {
            upkeepNeeded = true;
            performData = abi.encode(runningGames, totalRunning);
        } else {
            upkeepNeeded = false;
        }
    }

    // NOTE This will fail if there are too many games running
    function performUpkeep(bytes calldata performData) external override {
        (uint[] memory runningGames, uint totalRunning) = abi.decode(
            performData,
            (uint[], uint)
        );

        for (uint i = 0; i < totalRunning; i++) {
            Bingo bingo = Bingo(contracts[runningGames[i]]);
            if (bingo.canDrawNumber()) {
                bingo.drawNumber();
            }
        }
    }
}
