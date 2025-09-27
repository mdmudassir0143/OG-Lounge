"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Wallet, 
  AlertTriangle, 
  CheckCircle2,
  Copy,
  ExternalLink,
  Network
} from "lucide-react";

export function MobileConnectButton() {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== 'loading';
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === 'authenticated');

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
            className="w-full space-y-3"
          >
            {(() => {
              // Not connected state
              if (!connected) {
                return (
                  <Button
                    onClick={openConnectModal}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                    size="lg"
                  >
                    <Wallet className="mr-2 h-5 w-5" />
                    Connect Wallet
                  </Button>
                );
              }

              // Wrong network state
              if (chain.unsupported) {
                return (
                  <Button
                    onClick={openChainModal}
                    variant="destructive"
                    className="w-full animate-pulse"
                    size="lg"
                  >
                    <AlertTriangle className="mr-2 h-5 w-5" />
                    Switch Network
                  </Button>
                );
              }

              // Connected state with stacked layout
              return (
                <div className="w-full space-y-3">
                  {/* Network Info */}
                  <Button
                    onClick={openChainModal}
                    variant="outline"
                    className="w-full border-green-200 bg-green-50 hover:bg-green-100 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-200 dark:hover:bg-green-900/30"
                  >
                    <Network className="mr-2 h-4 w-4" />
                    <div className="flex items-center gap-2">
                      {chain.hasIcon && (
                        <div
                          className="rounded-full overflow-hidden"
                          style={{
                            background: chain.iconBackground,
                            width: 16,
                            height: 16,
                          }}
                        >
                          {chain.iconUrl && (
                            <img
                              alt={chain.name ?? 'Chain icon'}
                              src={chain.iconUrl}
                              style={{ width: 16, height: 16 }}
                            />
                          )}
                        </div>
                      )}
                      <span>{chain.name}</span>
                    </div>
                  </Button>

                  {/* Account Info Card */}
                  <div className="w-full p-4 border rounded-lg bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={account.ensAvatar || undefined} />
                        <AvatarFallback className="text-sm">
                          {account.displayName?.slice(0, 2) || 'W'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <p className="text-sm font-medium">Connected</p>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {account.ensName || account.displayName}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                      <span className="font-mono truncate flex-1">{account.address}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={() => {
                          navigator.clipboard.writeText(account.address);
                        }}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>

                    {account.displayBalance && (
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-muted-foreground">Balance:</span>
                        <Badge variant="secondary" className="font-mono">
                          {account.displayBalance}
                        </Badge>
                      </div>
                    )}

                    <Button
                      onClick={openAccountModal}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Account Details
                    </Button>
                  </div>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}