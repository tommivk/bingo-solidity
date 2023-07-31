import "../styles/globals.css";
import "react-toastify/dist/ReactToastify.css";
import type { AppProps } from "next/app";
import { WagmiConfig, configureChains, createClient } from "wagmi";
import { polygonMumbai } from "wagmi/chains";
import { Web3Modal } from "@web3modal/react";
import { EthereumClient } from "@web3modal/ethereum";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";
import { InjectedConnector } from "wagmi/connectors/injected";
import { ToastContainer } from "react-toastify";
import NextNProgress from "nextjs-progressbar";

const PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "";
const ACHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY ?? "";

export default function App({ Component, pageProps }: AppProps) {
  const chains = [polygonMumbai];
  const { provider } = configureChains(
    chains,
    [alchemyProvider({ apiKey: ACHEMY_API_KEY })],
    {
      pollingInterval: 5000,
    }
  );

  const connector = new WalletConnectConnector({
    chains,
    options: {
      projectId: PROJECT_ID,
      showQrModal: false,
    },
  });

  const client = createClient({
    autoConnect: true,
    provider,
    connectors: [new InjectedConnector({ chains }), connector],
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
      />
      <ToastContainer
        position="bottom-right"
        theme="dark"
        pauseOnFocusLoss={false}
      />
    </>
  );
}
