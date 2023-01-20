import { Web3Button } from "@web3modal/react";
import { Address } from "wagmi";
import { FetchBalanceResult } from "@wagmi/core";
import Dropdown from "./Dropdown";

type Props = {
  address: Address | undefined;
  balance: FetchBalanceResult | undefined;
  className?: string;
};

const AccountButtons = ({ address, balance, className }: Props) => {
  return (
    <div className={className}>
      {address && balance ? (
        <Dropdown address={address} balance={balance} />
      ) : (
        <Web3Button />
      )}
    </div>
  );
};

export default AccountButtons;
