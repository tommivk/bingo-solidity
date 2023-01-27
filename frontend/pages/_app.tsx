import "../styles/globals.css";
import "react-toastify/dist/ReactToastify.css";
import type { AppProps } from "next/app";
import { chain, createClient, WagmiConfig, configureChains } from "wagmi";
import { Web3Modal } from "@web3modal/react";
import { EthereumClient } from "@web3modal/ethereum";
import { publicProvider } from "wagmi/providers/public";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";
import { InjectedConnector } from "wagmi/connectors/injected";
import { ToastContainer } from "react-toastify";
import NextNProgress from "nextjs-progressbar";

const PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "";

export default function App({ Component, pageProps }: AppProps) {
  const chains = [chain.polygonMumbai];
  const { provider } = configureChains(chains, [publicProvider()], {
    pollingInterval: 1000,
  });

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
        <NextNProgress
          color="#29D"
          startPosition={0.3}
          stopDelayMs={300}
          height={1}
          showOnShallow={true}
          options={{ showSpinner: false, easing: "ease" }}
        />
      </WagmiConfig>
      <Web3Modal
        projectId={PROJECT_ID}
        ethereumClient={ethereumClient}
        themeMode="dark"
        themeColor="blue"
        themeBackground="themeColor"
      />
      <ToastContainer
        position="bottom-right"
        theme="dark"
        pauseOnFocusLoss={false}
      />
    </>
  );
}
