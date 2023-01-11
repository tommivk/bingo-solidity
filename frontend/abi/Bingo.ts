export const abi = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_host",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_ticketCost",
        "type": "uint256"
      },
      {
        "internalType": "uint8",
        "name": "_maxPlayers",
        "type": "uint8"
      },
      {
        "internalType": "address",
        "name": "_vrfCoordinator",
        "type": "address"
      },
      {
        "internalType": "uint64",
        "name": "_vrfSubscriptionId",
        "type": "uint64"
      },
      {
        "internalType": "bytes32",
        "name": "_vrfKeyHash",
        "type": "bytes32"
      }
    ],
    "stateMutability": "payable",
    "type": "constructor"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "have",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "want",
        "type": "address"
      }
    ],
    "name": "OnlyCoordinatorCanFulfill",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "_player",
        "type": "address"
      }
    ],
    "name": "BingoFound",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint64",
        "name": "_timeStarted",
        "type": "uint64"
      }
    ],
    "name": "GameStarted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "_newHost",
        "type": "address"
      }
    ],
    "name": "HostChanged",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint8",
        "name": "_number",
        "type": "uint8"
      }
    ],
    "name": "NumberDrawn",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "_player",
        "type": "address"
      }
    ],
    "name": "PlayerLeft",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "_to",
        "type": "address"
      }
    ],
    "name": "TicketBought",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "_vrfRequestId",
        "type": "uint256"
      }
    ],
    "name": "VRFFulfilled",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "_vrfRequestId",
        "type": "uint256"
      }
    ],
    "name": "VRFRequested",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "addressToTicket",
    "outputs": [
      {
        "internalType": "bool",
        "name": "valid",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "paidOut",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_to",
        "type": "address"
      }
    ],
    "name": "buyTicket",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "callBingo",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "canDrawNumber",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint8[25]",
        "name": "card",
        "type": "uint8[25]"
      }
    ],
    "name": "checkBingo",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "claimHost",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "drawNumber",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "game",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "ticketCost",
        "type": "uint256"
      },
      {
        "internalType": "uint8",
        "name": "maxPlayers",
        "type": "uint8"
      },
      {
        "internalType": "uint8",
        "name": "playersJoined",
        "type": "uint8"
      },
      {
        "internalType": "uint8",
        "name": "totalNumbersDrawn",
        "type": "uint8"
      },
      {
        "internalType": "uint8",
        "name": "hostActionDeadline",
        "type": "uint8"
      },
      {
        "internalType": "uint8",
        "name": "bingoCallPeriod",
        "type": "uint8"
      },
      {
        "internalType": "uint8",
        "name": "winnerCount",
        "type": "uint8"
      },
      {
        "internalType": "uint64",
        "name": "hostLastActionTime",
        "type": "uint64"
      },
      {
        "internalType": "uint64",
        "name": "bingoFoundTime",
        "type": "uint64"
      },
      {
        "internalType": "enum Bingo.GameStatus",
        "name": "gameStatus",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getBingoCards",
    "outputs": [
      {
        "internalType": "uint8[25][]",
        "name": "",
        "type": "uint8[25][]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getDrawnNumbers",
    "outputs": [
      {
        "internalType": "uint8[]",
        "name": "",
        "type": "uint8[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getGame",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "ticketCost",
            "type": "uint256"
          },
          {
            "internalType": "uint8",
            "name": "maxPlayers",
            "type": "uint8"
          },
          {
            "internalType": "uint8",
            "name": "playersJoined",
            "type": "uint8"
          },
          {
            "internalType": "uint8",
            "name": "totalNumbersDrawn",
            "type": "uint8"
          },
          {
            "internalType": "uint8",
            "name": "hostActionDeadline",
            "type": "uint8"
          },
          {
            "internalType": "uint8",
            "name": "bingoCallPeriod",
            "type": "uint8"
          },
          {
            "internalType": "uint8",
            "name": "winnerCount",
            "type": "uint8"
          },
          {
            "internalType": "uint64",
            "name": "hostLastActionTime",
            "type": "uint64"
          },
          {
            "internalType": "uint64",
            "name": "bingoFoundTime",
            "type": "uint64"
          },
          {
            "internalType": "enum Bingo.GameStatus",
            "name": "gameStatus",
            "type": "uint8"
          },
          {
            "internalType": "address[]",
            "name": "joinedPlayers",
            "type": "address[]"
          },
          {
            "internalType": "uint8[]",
            "name": "numbersLeft",
            "type": "uint8[]"
          }
        ],
        "internalType": "struct Bingo.GameState",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_address",
        "type": "address"
      }
    ],
    "name": "getTicket",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint8[25]",
            "name": "card",
            "type": "uint8[25]"
          },
          {
            "internalType": "bool",
            "name": "valid",
            "type": "bool"
          },
          {
            "internalType": "bool",
            "name": "paidOut",
            "type": "bool"
          }
        ],
        "internalType": "struct Bingo.Ticket",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "host",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "leaveGame",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint8",
        "name": "",
        "type": "uint8"
      }
    ],
    "name": "numbersDrawn",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "requestId",
        "type": "uint256"
      },
      {
        "internalType": "uint256[]",
        "name": "randomWords",
        "type": "uint256[]"
      }
    ],
    "name": "rawFulfillRandomWords",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "startGame",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "vrfRequestId",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "vrfRequests",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "vrfSubscriptionId",
    "outputs": [
      {
        "internalType": "uint64",
        "name": "",
        "type": "uint64"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "winners",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "withdrawWinnings",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  }
] as const