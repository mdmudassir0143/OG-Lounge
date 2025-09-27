'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useContracts } from '@/lib/contracts-context';
import type { Address } from 'viem';
import type { Listing } from '@/lib/contracts-context';

interface UseMarketplaceResult {
  // Listing functions
  listItem: (tokenId: bigint, price: bigint) => Promise<{ success: boolean; error?: string; listingId?: bigint }>;
  cancelListing: (listingId: bigint) => Promise<{ success: boolean; error?: string }>;
  
  // Buying functions
  buyItem: (listingId: bigint, price: bigint) => Promise<{ success: boolean; error?: string }>;
  
  // View functions
  getListing: (listingId: bigint) => Promise<Listing | null>;
  
  // Approval functions
  approveMarketplace: (tokenId: bigint) => Promise<{ success: boolean; error?: string }>;
  setApprovalForAll: (approved: boolean) => Promise<{ success: boolean; error?: string }>;
  
  // Check functions
  isApprovedForAll: (owner: Address) => Promise<boolean>;
  getApproved: (tokenId: bigint) => Promise<Address>;
  
  // Loading states
  isListing: boolean;
  isBuying: boolean;
  isCanceling: boolean;
  isApproving: boolean;
}

export function useMarketplace(): UseMarketplaceResult {
  const contracts = useContracts();
  const [isListing, setIsListing] = useState(false);
  const [isBuying, setIsBuying] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  const listItem = useCallback(async (tokenId: bigint, price: bigint) => {
    setIsListing(true);
    try {
      // Check if marketplace is approved
      const isApproved = await contracts.isApprovedForAll(
        contracts.address!,
        contracts.contractAddresses.marketplace
      );
      
      if (!isApproved) {
        // Check for individual token approval
        const approvedAddress = await contracts.getApproved(tokenId);
        if (approvedAddress !== contracts.contractAddresses.marketplace) {
          return { 
            success: false, 
            error: 'Please approve the marketplace to manage your NFT first' 
          };
        }
      }

      const result = await contracts.listItem(tokenId, price);
      
      if (result.success) {
        // Note: We can't easily get the listingId from the transaction result
        // In a real implementation, you'd parse the event logs to get the listingId
        return { success: true };
      }
      
      return { success: false, error: result.error };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to list item';
      return { success: false, error: errorMessage };
    } finally {
      setIsListing(false);
    }
  }, [contracts]);

  const cancelListing = useCallback(async (listingId: bigint) => {
    setIsCanceling(true);
    try {
      const result = await contracts.cancelListing(listingId);
      return { success: result.success, error: result.error };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to cancel listing';
      return { success: false, error: errorMessage };
    } finally {
      setIsCanceling(false);
    }
  }, [contracts]);

  const buyItem = useCallback(async (listingId: bigint, price: bigint) => {
    setIsBuying(true);
    try {
      const result = await contracts.buyItem(listingId, price);
      return { success: result.success, error: result.error };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to buy item';
      return { success: false, error: errorMessage };
    } finally {
      setIsBuying(false);
    }
  }, [contracts]);

  const getListing = useCallback(async (listingId: bigint) => {
    try {
      return await contracts.getListing(listingId);
    } catch (error) {
      console.error('Failed to get listing:', error);
      return null;
    }
  }, [contracts]);

  const approveMarketplace = useCallback(async (tokenId: bigint) => {
    setIsApproving(true);
    try {
      const result = await contracts.approve(contracts.contractAddresses.marketplace, tokenId);
      return { success: result.success, error: result.error };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to approve marketplace';
      return { success: false, error: errorMessage };
    } finally {
      setIsApproving(false);
    }
  }, [contracts]);

  const setApprovalForAll = useCallback(async (approved: boolean) => {
    setIsApproving(true);
    try {
      const result = await contracts.setApprovalForAll(contracts.contractAddresses.marketplace, approved);
      return { success: result.success, error: result.error };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to set approval';
      return { success: false, error: errorMessage };
    } finally {
      setIsApproving(false);
    }
  }, [contracts]);

  const isApprovedForAll = useCallback(async (owner: Address) => {
    try {
      return await contracts.isApprovedForAll(owner, contracts.contractAddresses.marketplace);
    } catch (error) {
      console.error('Failed to check approval:', error);
      return false;
    }
  }, [contracts]);

  const getApproved = useCallback(async (tokenId: bigint) => {
    try {
      return await contracts.getApproved(tokenId);
    } catch (error) {
      console.error('Failed to get approved address:', error);
      return '0x0000000000000000000000000000000000000000' as Address;
    }
  }, [contracts]);

  return {
    listItem,
    cancelListing,
    buyItem,
    getListing,
    approveMarketplace,
    setApprovalForAll,
    isApprovedForAll,
    getApproved,
    isListing,
    isBuying,
    isCanceling,
    isApproving,
  };
}