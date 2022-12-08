// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

// import "hardhat/console.sol";

contract Bingo {
    enum GameState {
        SETUP,
        RUNNING,
        BINGOFOUND
    }

    struct Ticket {
        uint8[25] card;
        bool valid;
        bool paidOut;
    }

    uint public ticketCost;
    uint8 public maxPlayers;
    uint8 public playersJoined;
    uint8 public totalNumbersDrawn;
    uint8 public hostActionDeadline = 3 minutes;
    uint8 public bingoCallPeriod = 3 minutes;
    uint8 public winnerCount;
    uint64 public hostLastActionTime;
    uint64 public bingoFoundTime;
    address public host;

    address[] joinedPlayers;

    GameState public gameState;

    mapping(address => Ticket) public addressToTicket;
    mapping(address => bool) public winners;
    mapping(uint8 => bool) public numbersDrawn;

    event BingoFound(address indexed _player);
    event NumberDrawn(uint8 _number);
    event TicketBought(address indexed _to);
    event HostChanged(address indexed _newHost);
    event PlayerLeft(address indexed _player);
    event GameStarted(uint64 _timeStarted);

    constructor(address _host, uint _ticketCost, uint8 _maxPlayers) payable {
        host = _host;
        ticketCost = _ticketCost;
        maxPlayers = _maxPlayers;
        buyTicket(_host);
    }

    function callBingo() public {
        require(gameState > GameState.SETUP, "The game has not started yet");
        require(!winners[msg.sender], "You have already won");
        if (gameState == GameState.BINGOFOUND) {
            require(
                block.timestamp < (bingoFoundTime + bingoCallPeriod),
                "Bingo call period has ended"
            );
        }

        Ticket memory ticket = addressToTicket[msg.sender];
        require(ticket.valid, "You don't have a valid ticket");

        uint8[25] memory card = ticket.card;

        bool bingo = checkBingo(card);
        require(bingo, "There was no bingo :(");

        if (bingoFoundTime == 0) {
            bingoFoundTime = uint64(block.timestamp);
            gameState = GameState.BINGOFOUND;
        }

        winners[msg.sender] = true;
        winnerCount++;
        emit BingoFound(msg.sender);
    }

    bool lock = false;

    function withdrawWinnings() public payable {
        require(!lock);
        lock = true;

        require(
            gameState == GameState.BINGOFOUND,
            "The game has not ended yet"
        );
        require(
            block.timestamp > (bingoFoundTime + bingoCallPeriod),
            "Withdraw period has not started yet"
        );
        require(winners[msg.sender], "You are not a winner");

        Ticket storage ticket = addressToTicket[msg.sender];
        require(!ticket.paidOut, "You have already withdrawed");

        (bool success, ) = payable(msg.sender).call{
            value: (ticketCost * playersJoined) / winnerCount
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

    // TODO Implement chainlink VRF
    function drawNumber(uint8 _number) public onlyHost {
        require(_number > 0 && _number < 76, "Number must be between 1 and 75");
        require(!numbersDrawn[_number], "Number has already been drawn");
        require(gameState == GameState.RUNNING, "The game is not running");
        require(totalNumbersDrawn < 75, "All of the numbers have been drawn");
        totalNumbersDrawn++;
        numbersDrawn[_number] = true;
        hostLastActionTime = uint64(block.timestamp);
        emit NumberDrawn(_number);
    }

    function getDrawnNumbers() public view returns (uint8[] memory) {
        uint8[] memory numbers = new uint8[](totalNumbersDrawn);
        uint index = 0;
        for (uint8 i = 1; i < 76; i++) {
            if (numbersDrawn[i]) {
                numbers[index] = i;
                index++;
            }
        }
        return numbers;
    }

    function hostTimedOut() private view returns (bool) {
        if (
            gameState == GameState.RUNNING &&
            block.timestamp > (hostLastActionTime + hostActionDeadline)
        ) {
            return true;
        }
        return false;
    }

    function claimHost() public {
        bool timedOut = hostTimedOut();
        require(host == address(0) || timedOut);
        if (timedOut) {
            Ticket storage ticket = addressToTicket[host];
            delete ticket.valid;
            delete ticket.card;
        }
        host = msg.sender;
        emit HostChanged(msg.sender);
    }

    function leaveGame() public {
        require(gameState == GameState.SETUP, "The game has already started");
        require(addressToTicket[msg.sender].valid, "You are not a player");

        if (msg.sender == host) {
            host = address(0);
        }

        Ticket storage ticket = addressToTicket[msg.sender];
        delete ticket.valid;
        delete ticket.card;

        payable(msg.sender).transfer(ticketCost);
        playersJoined--;
        emit PlayerLeft(msg.sender);
    }

    function startGame() public onlyHost {
        require(gameState == GameState.SETUP, "The game has already started");
        gameState = GameState.RUNNING;
        hostLastActionTime = uint64(block.timestamp);
        emit GameStarted(hostLastActionTime);
    }

    function buyTicket(address _to) public payable {
        require(gameState == GameState.SETUP, "The game has already started");
        require(playersJoined < maxPlayers, "The game is full");
        require(msg.value >= ticketCost, "Insufficient amount sent");
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
        joinedPlayers.push(_to);

        playersJoined++;

        emit TicketBought(_to);
    }

    function getTicket(address _address) public view returns (Ticket memory) {
        return addressToTicket[_address];
    }

    function generateCard() private view returns (uint8[25] memory) {
        uint8[] memory nums = getNumbers();

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

    function getNumbers() public pure returns (uint8[] memory) {
        uint8[] memory numbers = new uint8[](75);
        for (uint8 i = 0; i < 75; i++) {
            numbers[i] = i + 1;
        }
        return numbers;
    }
}
