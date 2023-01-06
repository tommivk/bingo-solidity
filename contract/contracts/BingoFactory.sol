// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./Bingo.sol";
import "./VRFCoordinatorV2Interface.sol";
import "./LinkTokenInterface.sol";

contract BingoFactory {
    VRFCoordinatorV2Interface COORDINATOR;
    LinkTokenInterface LINKTOKEN;
    // ** Mumbai network **
    address vrfCoordinator = 0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed;
    address linkTokenContract = 0x326C977E6efc84E512bB9C30f76E30c160eD06FB;
    // The gas lane to use, which specifies the maximum gas price to bump to
    bytes32 keyHash =
        0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f;
    uint64 public vrfSubscriptionId;

    address public owner;
    Bingo[] contracts;

    event NewRoomCreated(
        address indexed _creator,
        address indexed _contractAddress,
        uint _ticketCost,
        uint8 _maxPlayers
    );
    event OwnerChanged(address indexed _newOwner);

    constructor(address _owner) {
        owner = _owner;
        COORDINATOR = VRFCoordinatorV2Interface(vrfCoordinator);
        LINKTOKEN = LinkTokenInterface(linkTokenContract);
        vrfSubscriptionId = COORDINATOR.createSubscription();
    }

    function createRoom(uint _ticketCost, uint8 _maxPlayers) public payable {
        Bingo bingo = new Bingo{value: msg.value}(
            msg.sender,
            _ticketCost,
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

    // 1000000000000000000 = 1 LINK
    function topUpSubscription(uint256 amount) external onlyOwner {
        LINKTOKEN.transferAndCall(
            address(COORDINATOR),
            amount,
            abi.encode(vrfSubscriptionId)
        );
    }
}
