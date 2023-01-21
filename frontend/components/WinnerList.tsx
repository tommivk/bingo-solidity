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
    <div className="max-h-full w-full px-3 overflow-auto">
      <h1 className="text-center text-xl py-2 mb-2">
        Total Winners: {winners.length}
      </h1>
      <table>
        <tbody>
          <tr>
            <td className="pr-2">Prize Pool:</td>
            <td>
              <span className="break-all">{prizePool}</span> MATIC
            </td>
          </tr>
          <tr>
            <td className="pr-2">Game Fee:</td>
            <td>
              <span className="break-all">{fee}</span> MATIC
            </td>
          </tr>
          <tr>
            <td className="pr-2">Prize Per Winner:</td>
            <td>
              <span className="text-yellow-500">
                <span className="break-all">{prizePerWinner}</span> MATIC
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      <div className="">
        <h1 className="text-center text-xl py-2 mb-2 ">Winners</h1>
        <ul className="text-center">
          {winners.map((address) => (
            <li key={address} className="break-all mb-2">
              {address}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default WinnerList;
