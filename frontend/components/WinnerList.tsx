import { ethers } from "ethers";
import { Address } from "wagmi";
import { GameState } from "../types";

type Props = {
  winners: ReadonlyArray<Address>;
  gameFee: ethers.BigNumber;
  gameState: GameState;
};

const WinnerList = ({ winners, gameFee, gameState }: Props) => {
  const playerCount = gameState.joinedPlayers.length;
  const prizePoolWei = gameState.ticketCost.mul(playerCount);
  const prizePool = ethers.utils.formatUnits(prizePoolWei);
  const fee = ethers.utils.formatEther(gameFee.toString());
  const prizePerWinnerWei = gameState.ticketCost
    .mul(playerCount)
    .sub(gameFee)
    .div(winners.length);
  const prizePerWinner = ethers.utils.formatUnits(prizePerWinnerWei);

  return (
    <div>
      <h1 className="text-center text-xl py-2 mb-2">
        Total Winners: {winners.length}
      </h1>
      <table>
        <tbody>
          <tr>
            <td className="pr-2">Prize Pool:</td>
            <td>{prizePool} MATIC</td>
          </tr>
          <tr>
            <td className="pr-2">Game Fee:</td>
            <td>{fee} MATIC</td>
          </tr>
          <tr>
            <td className="pr-2">Prize Per Winner:</td>
            <td>
              <span className="text-yellow-500">{prizePerWinner} MATIC</span>
            </td>
          </tr>
        </tbody>
      </table>

      <div className="mt-10">
        <h1 className="text-center text-xl py-2 mb-2">Winners</h1>
        <ul>
          {winners.map((address) => (
            <li key={address}>{address}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default WinnerList;
