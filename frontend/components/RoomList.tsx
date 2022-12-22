import { Address } from "wagmi";
import RoomDetails from "./RoomDetails";

type Props = {
  rooms: ReadonlyArray<Address> | undefined;
};

const RoomList = ({ rooms }: Props) => {
  return (
    <div className="flex flex-col items-center">
      <h1 className="text-xl text-center">Games</h1>
      <ul>
        {rooms
          ?.slice(0)
          .reverse()
          .map((contractAddress: string) => (
            <li key={contractAddress} className="my-3">
              <RoomDetails contractAddress={contractAddress} />
            </li>
          ))}
      </ul>
    </div>
  );
};

export default RoomList;
