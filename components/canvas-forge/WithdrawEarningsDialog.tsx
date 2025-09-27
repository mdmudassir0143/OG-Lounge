'use client';

import { useState, useEffect } from 'react';
import { formatEther } from 'viem';
import { useAccount } from 'wagmi';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useGameHub } from '@/hooks/use-game-hub';
import { Wallet, DollarSign, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface WithdrawEarningsDialogProps {
  children?: React.ReactNode;
}

export function WithdrawEarningsDialog({ children }: WithdrawEarningsDialogProps) {
  const { address } = useAccount();
  const { getCreatorEarnings, withdrawEarnings, isWithdrawing } = useGameHub();
  const [earnings, setEarnings] = useState<bigint>(BigInt(0));
  const [isOpen, setIsOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshEarnings = async () => {
    if (!address) return;
    
    setIsRefreshing(true);
    try {
      const currentEarnings = await getCreatorEarnings(address);
      setEarnings(currentEarnings);
    } catch (error) {
      console.error('Failed to refresh earnings:', error);
      toast.error('Failed to fetch earnings');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (isOpen && address) {
      refreshEarnings();
    }
  }, [isOpen, address]);

  const handleWithdraw = async () => {
    try {
      const result = await withdrawEarnings();
      
      if (result.success) {
        toast.success('Earnings withdrawn successfully!');
        setEarnings(BigInt(0)); // Reset earnings after successful withdrawal
        setIsOpen(false);
      } else {
        toast.error(result.error || 'Failed to withdraw earnings');
      }
    } catch (error) {
      toast.error('Failed to withdraw earnings');
    }
  };

  const earningsInEth = formatEther(earnings);
  const hasEarnings = earnings > BigInt(0);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" className="gap-2">
            <Wallet className="h-4 w-4" />
            Withdraw Earnings
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="rounded-full bg-green-100 p-2 dark:bg-green-900">
              <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            Creator Earnings
          </DialogTitle>
          <DialogDescription>
            Withdraw your earnings from game plays by other users.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg bg-muted p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Available Earnings</p>
                <p className="text-2xl font-bold">
                  {earningsInEth} ETH
                </p>
                {hasEarnings && (
                  <p className="text-xs text-muted-foreground">
                    ≈ ${(Number.parseFloat(earningsInEth) * 2500).toFixed(2)} USD
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={refreshEarnings}
                disabled={isRefreshing}
                className="text-muted-foreground hover:text-foreground"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>

          {!hasEarnings && (
            <div className="text-center text-sm text-muted-foreground">
              <p>No earnings available yet.</p>
              <p>Earnings come from other users buying chances to play your games.</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleWithdraw}
            disabled={!hasEarnings || isWithdrawing}
            className="gap-2"
          >
            {isWithdrawing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Withdrawing...
              </>
            ) : (
              <>
                <Wallet className="h-4 w-4" />
                Withdraw {earningsInEth} ETH
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}