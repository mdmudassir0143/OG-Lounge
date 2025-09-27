"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createConfig, http, WagmiProvider } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { defineChain } from "viem";
import { RainbowKitProvider, getDefaultConfig } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";

const queryClient = new QueryClient();

// Define 0G Testnet chain
const zeroGTestnet = defineChain({
  id: 16602,
  name: "0G Testnet",
  nativeCurrency: {
    name: "0G Token",
    symbol: "A0GI",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://evmrpc-testnet.0g.ai"],
    },
  },
  blockExplorers: {
    default: {
      name: "0G Explorer",
      url: "https://chainscan-testnet.0g.ai",
    },
  },
  testnet: true,
});

const config = getDefaultConfig({
  appName: "OG-Lounge",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "b1f870b60e5370b358de2f8b0d6b686a",
  chains: [zeroGTestnet, mainnet, sepolia],
  ssr: true, // If your dApp uses server side rendering (SSR)
});

const EthereumWalletProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default EthereumWalletProvider;
