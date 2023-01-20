import { Web3Button } from "@web3modal/react";
import { Address } from "wagmi";
import { FetchBalanceResult } from "@wagmi/core";
import Dropdown from "./Dropdown";

type Props = {
  address: Address | undefined;
  balance: FetchBalanceResult | undefined;
};

const AccountButtons = ({ address, balance }: Props) => {
  return (
    <div className="p-4 flex justify-end sm:fixed top-0 right-0">
      {address && balance ? (
        <Dropdown address={address} balance={balance} />
      ) : (
        <Web3Button />
      )}
    </div>
  );
};

export default AccountButtons;
