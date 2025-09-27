"use client";
import { useAccount, useBalance } from "wagmi";

const BalanceBadge = () => {
  const { address: walletAddress } = useAccount();

  const { data: walletBalance } = useBalance({
    address: walletAddress,
  });

  const DECIMAL_PLACES = 4;

  const formatWalletBalance = (balanceData?: {
    value: bigint;
    decimals: number;
    symbol: string;
  }) => {
    if (!(balanceData?.value && balanceData?.decimals)) {
      return "0.0000 ETH";
    }
    const value = Number(balanceData.value) / 10 ** balanceData.decimals;
    return `${value.toFixed(DECIMAL_PLACES)} ${balanceData.symbol}`;
  };
  return (
    <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 font-medium text-blue-800 text-sm dark:bg-blue-900/30 dark:text-blue-300">
      {formatWalletBalance(walletBalance)}
    </span>
  );
};

export default BalanceBadge;
