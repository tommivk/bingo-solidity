import "../styles/globals.css";
import type { AppProps } from "next/app";
import { chain, createClient, WagmiConfig, configureChains } from "wagmi";
import { Web3Modal } from "@web3modal/react";
import { EthereumClient } from "@web3modal/ethereum";
import { publicProvider } from "wagmi/providers/public";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";
import { InjectedConnector } from "wagmi/connectors/injected";

const PROJECT_ID = process.env.WALLETCONNECT_PROJECT_ID ?? "";

export default function App({ Component, pageProps }: AppProps) {
  const chains = [chain.hardhat];
  const { provider } = configureChains(chains, [publicProvider()]);

  const client = createClient({
    autoConnect: true,
    connectors: [
      new InjectedConnector({ chains }),
      new WalletConnectConnector({
        chains,
        options: {
          qrcode: false,
        },
      }),
    ],
    provider,
  });

  const ethereumClient = new EthereumClient(client, chains);

  return (
    <>
      <WagmiConfig client={client}>
        <Component {...pageProps} />
      </WagmiConfig>
      <Web3Modal projectId={PROJECT_ID} ethereumClient={ethereumClient} />
    </>
  );
}
