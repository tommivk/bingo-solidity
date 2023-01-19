import { GameState } from "./types";

const errorMessages = [
  "The game has already started",
  "The game has not started yet",
  "You have already won",
  "Bingo call period has ended",
  "You don't have a valid ticket",
  "There was no bingo :(",
  "The game has not ended yet",
  "Withdraw period has not started yet",
  "You are not a winner",
  "You have already withdrawed",
  "Failed to withdraw",
  "Only game host can call this function",
  "Number must be between 1 and 75",
  "Number has already been drawn",
  "The game is not running",
  "All of the numbers have been drawn",
  "You are not a player",
  "The game is full",
  "Insufficient amount sent",
  "This address already owns a ticket",
  "Insufficient funds",
  "MinPlayers * TicketCost must be larger than the game fee",
  "Max player count must be larger or equal to min player count",
];

export const parseErrorMessage = (
  errorString: string | undefined,
  fallback?: string
) => {
  if (errorString?.toLowerCase().includes("action_rejected")) return; // Cancelled by the user

  const errorMsg = errorMessages.find((message) =>
    errorString?.toLowerCase().includes(message.toLowerCase())
  );
  return errorMsg ?? fallback;
};

export const gameStatusToString = (gameState: GameState | undefined) => {
  if (!gameState) return;

  const players = gameState.joinedPlayers.length;

  if (gameState.gameStatus === 0) {
    if (players < gameState.minPlayers) {
      return "Waiting for players";
    }
    return "Waiting for the host to start the game";
  }
  if (gameState.gameStatus === 1) return "Running";
  if (gameState.gameStatus === 2) return "Finished";
};
