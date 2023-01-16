import { Address } from "wagmi";

const WinnerList = ({ winners }: { winners: ReadonlyArray<Address> }) => {
  return (
    <div>
      <h1 className="text-center text-xl py-2 mb-2">
        Winners: {winners.length}
      </h1>
      <div className="mt-10">
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
