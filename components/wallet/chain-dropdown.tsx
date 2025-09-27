"use client";
import { ChevronDown } from "lucide-react";
import { useChainId, useSwitchChain } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const CHAIN_NAMES = {
  [mainnet.id]: "Ethereum",
  [sepolia.id]: "Sepolia",
} as const;

export function EthereumChainDropdown() {
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const handleChainSwitch = (newChainId: number) => {
    switchChain({ chainId: newChainId });
  };

  const currentChainName =
    CHAIN_NAMES[chainId as keyof typeof CHAIN_NAMES] || "Unknown";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="gap-2" size="sm" variant="outline">
          {currentChainName}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleChainSwitch(mainnet.id)}>
          Ethereum Mainnet
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleChainSwitch(sepolia.id)}>
          Ethereum Sepolia
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
