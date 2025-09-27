"use client";
import { Shield, Wallet, Zap } from "lucide-react";
import { useAccount } from "wagmi";
import { EthereumConnectButton } from "@/components/wallet/connect-button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const LoadingSkeleton = () => (
  <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
    <Card className="mx-4 w-full max-w-md">
      <CardHeader className="space-y-4">
        <Skeleton className="mx-auto h-8 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="mx-auto h-4 w-2/3" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-3/5" />
        </div>
      </CardContent>
    </Card>
  </div>
);

const WalletConnectPrompt = () => (
  <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 dark:from-gray-900 dark:to-gray-800">
    <Card className="w-full max-w-md border-0 bg-white/80 shadow-xl backdrop-blur-sm dark:bg-gray-900/80">
      <CardHeader className="space-y-4 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-600">
          <Wallet className="h-8 w-8 text-white" />
        </div>
        <div>
          <CardTitle className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text font-bold text-2xl text-transparent">
            Connect Your Wallet
          </CardTitle>
          <CardDescription className="mt-2 text-gray-600 dark:text-gray-400">
            Connect your Ethereum wallet to access the gaming platform
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20">
            <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
            <div className="text-sm">
              <div className="font-medium text-green-800 dark:text-green-200">
                Secure
              </div>
              <div className="text-green-600 dark:text-green-400">
                Your wallet stays in your control
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
            <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <div className="text-sm">
              <div className="font-medium text-blue-800 dark:text-blue-200">
                Fast
              </div>
              <div className="text-blue-600 dark:text-blue-400">
                Lightning-fast transactions on Ethereum
              </div>
            </div>
          </div>
        </div>

        <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            <strong>Supported Networks:</strong>
            <div className="mt-2 flex gap-2">
              <Badge
                className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                variant="secondary"
              >
                Ethereum Mainnet
              </Badge>
              <Badge
                className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
                variant="secondary"
              >
                Ethereum Sepolia
              </Badge>
            </div>
          </AlertDescription>
        </Alert>

        <div className="pt-2">
          <EthereumConnectButton />
        </div>
      </CardContent>
    </Card>
  </div>
);

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  const { isConnected, isConnecting } = useAccount();

  if (isConnecting) {
    return <LoadingSkeleton />;
  }

  if (!isConnected) {
    return <WalletConnectPrompt />;
  }

  return <>{children}</>;
};

export default AuthLayout;
