// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

// import "hardhat/console.sol";
import "./VRFConsumerBaseV2.sol";
import "./VRFCoordinatorV2Interface.sol";

contract Bingo is VRFConsumerBaseV2 {
    enum GameStatus {
        SETUP,
        RUNNING,
        BINGOFOUND
    }

    struct Ticket {
        uint8[25] card;
        bool valid;
        bool paidOut;
    }

    struct GameState {
        uint ticketCost;
        uint8 maxPlayers;
        uint8 playersJoined;
        uint8 totalNumbersDrawn;
        uint8 hostActionDeadline;
        uint8 bingoCallPeriod;
        uint8 winnerCount;
        uint64 hostLastActionTime;
        uint64 bingoFoundTime;
        GameStatus gameStatus;
        address[] joinedPlayers;
        uint8[] numbersLeft;
    }

    address public host;

    GameState public game;

    mapping(address => Ticket) public addressToTicket;
    mapping(address => bool) public winners;
    mapping(uint8 => bool) public numbersDrawn;

    event BingoFound(address indexed _player);
    event NumberDrawn(uint8 _number);
    event TicketBought(address indexed _to);
    event HostChanged(address indexed _newHost);
    event PlayerLeft(address indexed _player);
    event GameStarted(uint64 _timeStarted);
    event VRFRequested(uint indexed _vrfRequestId);
    event VRFFulfilled(uint indexed _vrfRequestId);

    VRFCoordinatorV2Interface COORDINATOR;
    address vrfCoordinator;
    bytes32 vrfKeyHash;
    uint256 public vrfRequestId;
    uint64 public vrfSubscriptionId;
    uint32 vrfCallbackGasLimit = 100000;
    uint16 vrfRequestConfirmations = 3;
    uint32 vrfNumWords = 1;
    mapping(uint => bool) public vrfRequests; // requestId => isFulfilled

    //prettier-ignore
    uint8[] numbers = [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
        11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
        21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
        31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
        41, 42, 43, 44, 45, 46, 47, 48, 49, 50,
        51, 52, 53, 54, 55, 56, 57, 58, 59, 60,
        61, 62, 63, 64, 65, 66, 67, 68, 69, 70,
        71, 72, 73, 74, 75
    ];

    constructor(
        address _host,
        uint _ticketCost,
        uint8 _maxPlayers,
        address _vrfCoordinator,
        uint64 _vrfSubscriptionId,
        bytes32 _vrfKeyHash
    ) payable VRFConsumerBaseV2(_vrfCoordinator) {
        host = _host;
        COORDINATOR = VRFCoordinatorV2Interface(_vrfCoordinator);
        vrfSubscriptionId = _vrfSubscriptionId;
        vrfKeyHash = _vrfKeyHash;
        game.ticketCost = _ticketCost;
        game.maxPlayers = _maxPlayers;
        game.bingoCallPeriod = 3 minutes;
        game.hostActionDeadline = 3 minutes;
        game.numbersLeft = numbers;
        buyTicket(_host);
    }

    function drawNumber() external {
        require(
            game.gameStatus == GameStatus.RUNNING,
            "The game is not running"
        );
        require(
            game.totalNumbersDrawn < 75,
            "All of the numbers have been drawn"
        );
        require(
            vrfRequestId == 0 || vrfRequests[vrfRequestId],
            "Previous VRF request has not been fullfilled yet"
        );

        requestRandomWords();
    }

    function canDrawNumber() external view returns (bool) {
        return
            game.gameStatus == Bingo.GameStatus.RUNNING &&
            game.numbersLeft.length > 0 &&
            (vrfRequestId == 0 || vrfRequests[vrfRequestId]);
    }

    function requestRandomWords() private {
        vrfRequestId = COORDINATOR.requestRandomWords(
            vrfKeyHash,
            vrfSubscriptionId,
            vrfRequestConfirmations,
            vrfCallbackGasLimit,
            vrfNumWords
        );
        emit VRFRequested(vrfRequestId);
    }

    function fulfillRandomWords(
        uint256 requestId,
        uint256[] memory randomWords
    ) internal override {
        require(game.gameStatus == GameStatus.RUNNING, "The game has ended");
        // Get random number between 0 and numbersLeft.length -1 inclusively
        uint randomIndex = (randomWords[0] % game.numbersLeft.length);
        uint8 number = game.numbersLeft[randomIndex];
        // remove chosen number from numbersLeft
        game.numbersLeft[randomIndex] = game.numbersLeft[
            game.numbersLeft.length - 1
        ];
        game.numbersLeft.pop();

        setNumberDrawn(number);
        vrfRequests[requestId] = true;
        emit VRFFulfilled(requestId);
    }

    function setNumberDrawn(uint8 _number) private {
        numbersDrawn[_number] = true;
        game.totalNumbersDrawn++;
        game.hostLastActionTime = uint64(block.timestamp);
        emit NumberDrawn(_number);
    }

    function getGame() public view returns (GameState memory) {
        return game;
    }

    function callBingo() public {
        require(
            game.gameStatus > GameStatus.SETUP,
            "The game has not started yet"
        );
        require(!winners[msg.sender], "You have already won");
        if (game.gameStatus == GameStatus.BINGOFOUND) {
            require(
                block.timestamp < (game.bingoFoundTime + game.bingoCallPeriod),
                "Bingo call period has ended"
            );
        }

        Ticket memory ticket = addressToTicket[msg.sender];
        require(ticket.valid, "You don't have a valid ticket");

        uint8[25] memory card = ticket.card;

        bool bingo = checkBingo(card);
        require(bingo, "There was no bingo :(");

        if (game.bingoFoundTime == 0) {
            game.bingoFoundTime = uint64(block.timestamp);
            game.gameStatus = GameStatus.BINGOFOUND;
        }

        winners[msg.sender] = true;
        game.winnerCount++;
        emit BingoFound(msg.sender);
    }

    bool lock = false;

    function withdrawWinnings() public payable {
        require(!lock);
        lock = true;

        require(
            game.gameStatus == GameStatus.BINGOFOUND,
            "The game has not ended yet"
        );
        require(
            block.timestamp > (game.bingoFoundTime + game.bingoCallPeriod),
            "Withdraw period has not started yet"
        );
        require(winners[msg.sender], "You are not a winner");

        Ticket storage ticket = addressToTicket[msg.sender];
        require(!ticket.paidOut, "You have already withdrawed");

        (bool success, ) = payable(msg.sender).call{
            value: (game.ticketCost * game.playersJoined) / game.winnerCount
        }("");
        require(success, "Failed to withdraw");

        ticket.paidOut = true;
        lock = false;
    }

    // Check for bingo
    // Index 12 is a wildcard
    function checkBingo(uint8[25] memory card) public view returns (bool) {
        if (checkDiagonals(card)) return true;

        for (uint i = 0; i < 5; i++) {
            // Check rows
            bool bingoFound = true;
            for (uint j = 0; j < 5; j++) {
                uint rowIndex = (i * 5) + j;
                if (rowIndex == 12) continue;
                if (!numbersDrawn[card[rowIndex]]) {
                    bingoFound = false;
                }
            }
            if (bingoFound) return true;

            // Check columns
            bingoFound = true;
            for (uint j = 0; j < 5; j++) {
                uint columnIndex = (5 * j) + i;
                if (columnIndex == 12) continue;
                if (!numbersDrawn[card[columnIndex]]) {
                    bingoFound = false;
                }
            }
            if (bingoFound) return true;
        }
        return false;
    }

    function checkDiagonals(uint8[25] memory card) private view returns (bool) {
        bool leftDiagonal = numbersDrawn[card[0]] &&
            numbersDrawn[card[6]] &&
            numbersDrawn[card[18]] &&
            numbersDrawn[card[24]];

        bool rightDiagonal = numbersDrawn[card[4]] &&
            numbersDrawn[card[8]] &&
            numbersDrawn[card[16]] &&
            numbersDrawn[card[20]];

        return (leftDiagonal || rightDiagonal) ? true : false;
    }

    modifier onlyHost() {
        require(msg.sender == host, "Only game host can call this function");
        _;
    }

    function getDrawnNumbers() public view returns (uint8[] memory) {
        uint8[] memory nums = new uint8[](game.totalNumbersDrawn);
        uint index = 0;
        for (uint8 i = 1; i < 76; i++) {
            if (numbersDrawn[i]) {
                nums[index] = i;
                index++;
            }
        }
        return nums;
    }

    function hostTimedOut() private view returns (bool) {
        if (
            game.gameStatus == GameStatus.RUNNING &&
            block.timestamp >
            (game.hostLastActionTime + game.hostActionDeadline)
        ) {
            return true;
        }
        return false;
    }

    function claimHost() public {
        bool timedOut = hostTimedOut();
        require(host == address(0) || timedOut);
        require(addressToTicket[msg.sender].valid, "You are not a player");
        if (timedOut) {
            Ticket storage ticket = addressToTicket[host];
            delete ticket.valid;
            delete ticket.card;
        }
        host = msg.sender;
        emit HostChanged(msg.sender);
    }

    function leaveGame() public {
        require(
            game.gameStatus == GameStatus.SETUP,
            "The game has already started"
        );
        require(addressToTicket[msg.sender].valid, "You are not a player");

        if (msg.sender == host) {
            host = address(0);
            emit HostChanged(address(0));
        }

        Ticket storage ticket = addressToTicket[msg.sender];
        delete ticket.valid;
        delete ticket.card;

        uint playerIndex;
        for (uint i = 0; i < game.joinedPlayers.length; i++) {
            if (game.joinedPlayers[i] == msg.sender) {
                playerIndex = i;
                break;
            }
        }
        game.joinedPlayers[playerIndex] = game.joinedPlayers[
            game.joinedPlayers.length - 1
        ];
        game.joinedPlayers.pop();

        payable(msg.sender).transfer(game.ticketCost);
        game.playersJoined--;
        emit PlayerLeft(msg.sender);
    }

    function startGame() public onlyHost {
        require(
            game.gameStatus == GameStatus.SETUP,
            "The game has already started"
        );
        game.gameStatus = GameStatus.RUNNING;
        game.hostLastActionTime = uint64(block.timestamp);
        emit GameStarted(game.hostLastActionTime);
    }

    function buyTicket(address _to) public payable {
        require(
            game.gameStatus == GameStatus.SETUP,
            "The game has already started"
        );
        require(game.playersJoined < game.maxPlayers, "The game is full");
        require(msg.value >= game.ticketCost, "Insufficient amount sent");
        require(
            addressToTicket[_to].card[0] == 0,
            "This address already owns a ticket"
        );
        uint8[25] memory bingoCard = generateCard();

        Ticket memory ticket;
        ticket.valid = true;
        ticket.card = bingoCard;
        ticket.paidOut = false;

        addressToTicket[_to] = ticket;
        game.joinedPlayers.push(_to);

        game.playersJoined++;

        emit TicketBought(_to);
    }

    function getTicket(address _address) public view returns (Ticket memory) {
        return addressToTicket[_address];
    }

    function getBingoCards() public view returns (uint8[25][] memory) {
        uint8[25][] memory tickets = new uint8[25][](game.joinedPlayers.length);

        uint index = 0;
        for (uint i = 0; i < game.joinedPlayers.length; i++) {
            Ticket memory ticket = addressToTicket[game.joinedPlayers[i]];
            if (ticket.valid) {
                tickets[index] = ticket.card;
                ++index;
            }
        }
        return tickets;
    }

    function generateCard() private view returns (uint8[25] memory) {
        uint8[] memory nums = numbers;

        // Randomize the array of numbers
        // Note This is pseudo-random
        for (uint i = 0; i < nums.length - 1; i++) {
            uint j = (uint(
                keccak256(
                    abi.encodePacked(
                        i,
                        block.difficulty,
                        block.timestamp,
                        msg.sender
                    )
                )
            ) % nums.length);
            uint8 temp = nums[i];
            nums[i] = nums[j];
            nums[j] = temp;
        }

        // Choose the first 25 values as the bingo card
        uint8[25] memory card;
        for (uint i = 0; i < 25; i++) {
            card[i] = nums[i];
        }
        return card;
    }
}
