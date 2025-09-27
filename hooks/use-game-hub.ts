'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useContracts } from '@/lib/contracts-context';
import type { Address } from 'viem';

interface UseGameHubResult {
  // Minting
  mintGameToken: (walletAddress: Address) => Promise<{ success: boolean; tokenId?: bigint; error?: string }>;
  
  // Playing
  playGame: (tokenId: bigint) => Promise<{ success: boolean; error?: string }>;
  
  // Chances
  getRemainingFreeChances: (user: Address, tokenId: bigint) => Promise<bigint>;
  getBoughtChances: (user: Address, tokenId: bigint) => Promise<bigint>;
  buyChance: (numberOfChances: number, gameNftID: bigint) => Promise<{ success: boolean; error?: string }>;
  
  // Earnings
  getCreatorEarnings: (creatorAddress: Address) => Promise<bigint>;
  withdrawEarnings: () => Promise<{ success: boolean; error?: string }>;
  
  // User info
  getUserTokens: (user: Address) => Promise<bigint[]>;
  getUserTokenCount: (user: Address) => Promise<bigint>;
  
  // Loading states
  isLoading: boolean;
  isMinting: boolean;
  isPlaying: boolean;
  isWithdrawing: boolean;
  isBuyingChance: boolean;
}

export function useGameHub(): UseGameHubResult {
  const contracts = useContracts();
  const [isLoading, setIsLoading] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isBuyingChance, setIsBuyingChance] = useState(false);

  const mintGameToken = useCallback(async (walletAddress: Address) => {
    setIsMinting(true);
    try {
      // Check current token count to determine if payment is required
      const currentCount = await contracts.getUserTokenCount(walletAddress);
      const paymentValue = currentCount >= BigInt(2) ? BigInt("500000000000000000") : BigInt(0); // 0.5 ETH if user has 2+ tokens
      
      const result = await contracts.createGameNFT(walletAddress, paymentValue);
      
      if (result.success) {
        // Get the token ID from the latest token minted
        const newTokenCount = await contracts.getUserTokenCount(walletAddress);
        const tokenId = newTokenCount - BigInt(1); // Latest token ID
        
        return { success: true, tokenId };
      }
      
      return { success: false, error: result.error };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to mint token';
      return { success: false, error: errorMessage };
    } finally {
      setIsMinting(false);
    }
  }, [contracts]);

  const playGame = useCallback(async (tokenId: bigint) => {
    setIsPlaying(true);
    try {
      const result = await contracts.playGame(tokenId);
      return { success: result.success, error: result.error };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to play game';
      return { success: false, error: errorMessage };
    } finally {
      setIsPlaying(false);
    }
  }, [contracts]);

  const getRemainingFreeChances = useCallback(async (user: Address, tokenId: bigint) => {
    try {
      return await contracts.getRemainingFreeChances(user, tokenId);
    } catch (error) {
      console.error('Failed to get remaining free chances:', error);
      return BigInt(0);
    }
  }, [contracts]);

  const getBoughtChances = useCallback(async (user: Address, tokenId: bigint) => {
    try {
      return await contracts.getBoughtChances(user, tokenId);
    } catch (error) {
      console.error('Failed to get bought chances:', error);
      return BigInt(0);
    }
  }, [contracts]);

  const buyChance = useCallback(async (numberOfChances: number, gameNftID: bigint) => {
    setIsBuyingChance(true);
    try {
      const result = await contracts.buyChance(numberOfChances, gameNftID);
      return { success: result.success, error: result.error };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to buy chance';
      return { success: false, error: errorMessage };
    } finally {
      setIsBuyingChance(false);
    }
  }, [contracts]);

  const getCreatorEarnings = useCallback(async (creatorAddress: Address) => {
    try {
      return await contracts.getCreatorEarnings(creatorAddress);
    } catch (error) {
      console.error('Failed to get creator earnings:', error);
      return BigInt(0);
    }
  }, [contracts]);

  const withdrawEarnings = useCallback(async () => {
    setIsWithdrawing(true);
    try {
      const result = await contracts.withdrawEarnings();
      return { success: result.success, error: result.error };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to withdraw earnings';
      return { success: false, error: errorMessage };
    } finally {
      setIsWithdrawing(false);
    }
  }, [contracts]);

  const getUserTokens = useCallback(async (user: Address) => {
    try {
      return await contracts.tokensOfOwner(user);
    } catch (error) {
      console.error('Failed to get user tokens:', error);
      return [];
    }
  }, [contracts]);

  const getUserTokenCount = useCallback(async (user: Address) => {
    try {
      return await contracts.getUserTokenCount(user);
    } catch (error) {
      console.error('Failed to get user token count:', error);
      return BigInt(0);
    }
  }, [contracts]);

  return {
    mintGameToken,
    playGame,
    getRemainingFreeChances,
    getBoughtChances,
    buyChance,
    getCreatorEarnings,
    withdrawEarnings,
    getUserTokens,
    getUserTokenCount,
    isLoading,
    isMinting,
    isPlaying,
    isWithdrawing,
    isBuyingChance,
  };
}