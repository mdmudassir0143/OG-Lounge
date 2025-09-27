"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Wallet, 
  ChevronDown, 
  AlertTriangle, 
  CheckCircle2,
  Copy,
  ExternalLink 
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function CustomConnectButton() {
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
          >
            {(() => {
              // Not connected state
              if (!connected) {
                return (
                  <Button
                    onClick={openConnectModal}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Wallet className="mr-2 h-4 w-4" />
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
                    className="animate-pulse"
                  >
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Wrong Network
                  </Button>
                );
              }

              // Connected state with dropdown
              return (
                <div className="flex items-center gap-2">
                  {/* Chain Button */}
                  <Button
                    onClick={openChainModal}
                    variant="outline"
                    size="sm"
                    className="border-green-200 bg-green-50 hover:bg-green-100 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-200 dark:hover:bg-green-900/30"
                  >
                    {chain.hasIcon && (
                      <div
                        className="mr-2 rounded-full overflow-hidden"
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
                    {chain.name}
                    <ChevronDown className="ml-1 h-3 w-3" />
                  </Button>

                  {/* Account Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-800 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-200 dark:hover:bg-blue-900/30"
                      >
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={account.ensAvatar || undefined} />
                            <AvatarFallback className="text-xs">
                              {account.displayName?.slice(0, 2) || 'W'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="max-w-[100px] truncate">
                            {account.displayName}
                          </span>
                          <ChevronDown className="h-3 w-3" />
                        </div>
                      </Button>
                    </DropdownMenuTrigger>
                    
                    <DropdownMenuContent align="end" className="w-64">
                      <DropdownMenuLabel className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        Connected Wallet
                      </DropdownMenuLabel>
                      
                      <DropdownMenuSeparator />
                      
                      <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
                        <div className="flex items-center gap-2 w-full">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={account.ensAvatar || undefined} />
                            <AvatarFallback className="text-xs">
                              {account.displayName?.slice(0, 2) || 'W'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {account.ensName || account.displayName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {account.address}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              navigator.clipboard.writeText(account.address);
                            }}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </DropdownMenuItem>

                      {account.displayBalance && (
                        <DropdownMenuItem className="px-3">
                          <div className="flex items-center justify-between w-full">
                            <span className="text-sm text-muted-foreground">Balance:</span>
                            <Badge variant="secondary" className="font-mono">
                              {account.displayBalance}
                            </Badge>
                          </div>
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuSeparator />
                      
                      <DropdownMenuItem onClick={openAccountModal}>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Account Details
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}