'use client';

import React, { createContext, useContext, type ReactNode } from 'react';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { parseEther, type Address, type Hash } from 'viem';

// Types
interface ContractAddresses {
  ownership: Address;
  marketplace: Address;
  gameHub: Address;
}

interface TransactionResult {
  hash: Hash;
  blockNumber?: bigint;
  gasUsed?: bigint;
  success: boolean;
  error?: string;
}

interface Listing {
  seller: Address;
  tokenId: bigint;
  price: bigint;
  listedAt: bigint;
}

interface TokenInfo {
  tokenId: bigint;
  owner: Address;
  creator: Address;
}

// Context Interface
interface ContractsContextValue {
  // Connection status
  isConnected: boolean;
  address?: Address;
  
  // Contract addresses
  contractAddresses: ContractAddresses;
  
  // GameHub functions
  buyChance: (numberOfChances: number, gameNftID: bigint) => Promise<TransactionResult>;
  withdrawEarnings: () => Promise<TransactionResult>;
  getCreatorEarnings: (creatorAddress: Address) => Promise<bigint>;
  
  // Marketplace functions
  listItem: (tokenId: bigint, price: bigint) => Promise<TransactionResult>;
  buyItem: (listingId: bigint, price: bigint) => Promise<TransactionResult>;
  cancelListing: (listingId: bigint) => Promise<TransactionResult>;
  getListing: (listingId: bigint) => Promise<Listing>;
  
  // Ownership functions
  mint: (to: Address) => Promise<TransactionResult>;
  ownerOf: (tokenId: bigint) => Promise<Address>;
  balanceOf: (owner: Address) => Promise<bigint>;
  totalMinted: () => Promise<bigint>;
  tokensOfOwner: (owner: Address) => Promise<bigint[]>;
  approve: (to: Address, tokenId: bigint) => Promise<TransactionResult>;
  setApprovalForAll: (operator: Address, approved: boolean) => Promise<TransactionResult>;
  transferFrom: (from: Address, to: Address, tokenId: bigint) => Promise<TransactionResult>;
  getTokenInfo: (tokenId: bigint) => Promise<TokenInfo>;
  isApprovedForAll: (owner: Address, operator: Address) => Promise<boolean>;
  getApproved: (tokenId: bigint) => Promise<Address>;
}

// Contract ABIs
const OWNERSHIP_ABI = [
  {
    type: "function",
    name: "mint",
    inputs: [{ name: "to", type: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "ownerOf",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "balanceOf",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "totalMinted",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "tokensOfOwner",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "uint256[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "approve",
    inputs: [{ name: "to", type: "address" }, { name: "tokenId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setApprovalForAll",
    inputs: [{ name: "operator", type: "address" }, { name: "approved", type: "bool" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "transferFrom",
    inputs: [{ name: "from", type: "address" }, { name: "to", type: "address" }, { name: "tokenId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "creators",
    inputs: [{ name: "", type: "uint256" }],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isApprovedForAll",
    inputs: [{ name: "owner", type: "address" }, { name: "operator", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getApproved",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
  },
] as const;

const MARKETPLACE_ABI = [
  {
    type: "function",
    name: "listItem",
    inputs: [{ name: "tokenId", type: "uint256" }, { name: "price", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "buyItem",
    inputs: [{ name: "listingId", type: "uint256" }],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "cancelListing",
    inputs: [{ name: "_listingId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getListing",
    inputs: [{ name: "_listingId", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "seller", type: "address" },
          { name: "tokenId", type: "uint256" },
          { name: "price", type: "uint256" },
          { name: "listedAt", type: "uint256" }
        ]
      }
    ],
    stateMutability: "view",
  },
] as const;

const GAMEHUB_ABI = [
  {
    type: "function",
    name: "buyChance",
    inputs: [{ name: "_numberOfchancesToBuy", type: "uint256" }, { name: "_gameNftID", type: "uint256" }],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "withdrawEarnings",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "creatorEarnings",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
] as const;

// Create Context
const ContractsContext = createContext<ContractsContextValue | undefined>(undefined);

// Contract Addresses (you'll need to update these with your deployed contract addresses)
const CONTRACT_ADDRESSES: ContractAddresses = {
  ownership: "0x0000000000000000000000000000000000000000" as Address, // Update with actual address
  marketplace: "0x0000000000000000000000000000000000000000" as Address, // Update with actual address
  gameHub: "0x0000000000000000000000000000000000000000" as Address, // Update with actual address
};

// Provider Component
export function ContractsProvider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  // Helper function to handle transaction errors
  const handleTransactionError = (error: unknown, operation: string): TransactionResult => {
    console.error(`Error ${operation}:`, error);
    return {
      hash: "0x" as Hash,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  };

  // GameHub Functions
  const buyChance = async (numberOfChances: number, gameNftID: bigint): Promise<TransactionResult> => {
    if (!walletClient || !publicClient) {
      return handleTransactionError(new Error("Wallet not connected"), "buying chance");
    }

    try {
      const value = parseEther((0.01 * numberOfChances).toString());
      
      const { request } = await publicClient.simulateContract({
        address: CONTRACT_ADDRESSES.gameHub,
        abi: GAMEHUB_ABI,
        functionName: "buyChance",
        args: [BigInt(numberOfChances), gameNftID],
        value,
        account: walletClient.account!,
      });

      const hash = await walletClient.writeContract(request);
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      
      return {
        hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed,
        success: receipt.status === "success",
      };
    } catch (error) {
      return handleTransactionError(error, "buying chance");
    }
  };

  const withdrawEarnings = async (): Promise<TransactionResult> => {
    if (!walletClient || !publicClient) {
      return handleTransactionError(new Error("Wallet not connected"), "withdrawing earnings");
    }

    try {
      const { request } = await publicClient.simulateContract({
        address: CONTRACT_ADDRESSES.gameHub,
        abi: GAMEHUB_ABI,
        functionName: "withdrawEarnings",
        account: walletClient.account!,
      });

      const hash = await walletClient.writeContract(request);
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      
      return {
        hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed,
        success: receipt.status === "success",
      };
    } catch (error) {
      return handleTransactionError(error, "withdrawing earnings");
    }
  };

  const getCreatorEarnings = async (creatorAddress: Address): Promise<bigint> => {
    if (!publicClient) {
      throw new Error("Public client not available");
    }

    const result = await publicClient.readContract({
      address: CONTRACT_ADDRESSES.gameHub,
      abi: GAMEHUB_ABI,
      functionName: "creatorEarnings",
      args: [creatorAddress],
    });
    
    return result as bigint;
  };

  // Marketplace Functions
  const listItem = async (tokenId: bigint, price: bigint): Promise<TransactionResult> => {
    if (!walletClient || !publicClient) {
      return handleTransactionError(new Error("Wallet not connected"), "listing item");
    }

    try {
      const { request } = await publicClient.simulateContract({
        address: CONTRACT_ADDRESSES.marketplace,
        abi: MARKETPLACE_ABI,
        functionName: "listItem",
        args: [tokenId, price],
        account: walletClient.account!,
      });

      const hash = await walletClient.writeContract(request);
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      
      return {
        hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed,
        success: receipt.status === "success",
      };
    } catch (error) {
      return handleTransactionError(error, "listing item");
    }
  };

  const buyItem = async (listingId: bigint, price: bigint): Promise<TransactionResult> => {
    if (!walletClient || !publicClient) {
      return handleTransactionError(new Error("Wallet not connected"), "buying item");
    }

    try {
      const { request } = await publicClient.simulateContract({
        address: CONTRACT_ADDRESSES.marketplace,
        abi: MARKETPLACE_ABI,
        functionName: "buyItem",
        args: [listingId],
        value: price,
        account: walletClient.account!,
      });

      const hash = await walletClient.writeContract(request);
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      
      return {
        hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed,
        success: receipt.status === "success",
      };
    } catch (error) {
      return handleTransactionError(error, "buying item");
    }
  };

  const cancelListing = async (listingId: bigint): Promise<TransactionResult> => {
    if (!walletClient || !publicClient) {
      return handleTransactionError(new Error("Wallet not connected"), "cancelling listing");
    }

    try {
      const { request } = await publicClient.simulateContract({
        address: CONTRACT_ADDRESSES.marketplace,
        abi: MARKETPLACE_ABI,
        functionName: "cancelListing",
        args: [listingId],
        account: walletClient.account!,
      });

      const hash = await walletClient.writeContract(request);
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      
      return {
        hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed,
        success: receipt.status === "success",
      };
    } catch (error) {
      return handleTransactionError(error, "cancelling listing");
    }
  };

  const getListing = async (listingId: bigint): Promise<Listing> => {
    if (!publicClient) {
      throw new Error("Public client not available");
    }

    const result = await publicClient.readContract({
      address: CONTRACT_ADDRESSES.marketplace,
      abi: MARKETPLACE_ABI,
      functionName: "getListing",
      args: [listingId],
    });
    
    const listing = result as {
      seller: Address;
      tokenId: bigint;
      price: bigint;
      listedAt: bigint;
    };
    
    return {
      seller: listing.seller,
      tokenId: listing.tokenId,
      price: listing.price,
      listedAt: listing.listedAt,
    };
  };

  // Ownership Functions
  const mint = async (to: Address): Promise<TransactionResult> => {
    if (!walletClient || !publicClient) {
      return handleTransactionError(new Error("Wallet not connected"), "minting token");
    }

    try {
      const { request } = await publicClient.simulateContract({
        address: CONTRACT_ADDRESSES.ownership,
        abi: OWNERSHIP_ABI,
        functionName: "mint",
        args: [to],
        account: walletClient.account!,
      });

      const hash = await walletClient.writeContract(request);
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      
      return {
        hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed,
        success: receipt.status === "success",
      };
    } catch (error) {
      return handleTransactionError(error, "minting token");
    }
  };

  const ownerOf = async (tokenId: bigint): Promise<Address> => {
    if (!publicClient) {
      throw new Error("Public client not available");
    }

    const result = await publicClient.readContract({
      address: CONTRACT_ADDRESSES.ownership,
      abi: OWNERSHIP_ABI,
      functionName: "ownerOf",
      args: [tokenId],
    });
    
    return result as Address;
  };

  const balanceOf = async (owner: Address): Promise<bigint> => {
    if (!publicClient) {
      throw new Error("Public client not available");
    }

    const result = await publicClient.readContract({
      address: CONTRACT_ADDRESSES.ownership,
      abi: OWNERSHIP_ABI,
      functionName: "balanceOf",
      args: [owner],
    });
    
    return result as bigint;
  };

  const totalMinted = async (): Promise<bigint> => {
    if (!publicClient) {
      throw new Error("Public client not available");
    }

    const result = await publicClient.readContract({
      address: CONTRACT_ADDRESSES.ownership,
      abi: OWNERSHIP_ABI,
      functionName: "totalMinted",
    });
    
    return result as bigint;
  };

  const tokensOfOwner = async (owner: Address): Promise<bigint[]> => {
    if (!publicClient) {
      throw new Error("Public client not available");
    }

    const result = await publicClient.readContract({
      address: CONTRACT_ADDRESSES.ownership,
      abi: OWNERSHIP_ABI,
      functionName: "tokensOfOwner",
      args: [owner],
    });
    
    return result as bigint[];
  };

  const approve = async (to: Address, tokenId: bigint): Promise<TransactionResult> => {
    if (!walletClient || !publicClient) {
      return handleTransactionError(new Error("Wallet not connected"), "approving token");
    }

    try {
      const { request } = await publicClient.simulateContract({
        address: CONTRACT_ADDRESSES.ownership,
        abi: OWNERSHIP_ABI,
        functionName: "approve",
        args: [to, tokenId],
        account: walletClient.account!,
      });

      const hash = await walletClient.writeContract(request);
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      
      return {
        hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed,
        success: receipt.status === "success",
      };
    } catch (error) {
      return handleTransactionError(error, "approving token");
    }
  };

  const setApprovalForAll = async (operator: Address, approved: boolean): Promise<TransactionResult> => {
    if (!walletClient || !publicClient) {
      return handleTransactionError(new Error("Wallet not connected"), "setting approval for all");
    }

    try {
      const { request } = await publicClient.simulateContract({
        address: CONTRACT_ADDRESSES.ownership,
        abi: OWNERSHIP_ABI,
        functionName: "setApprovalForAll",
        args: [operator, approved],
        account: walletClient.account!,
      });

      const hash = await walletClient.writeContract(request);
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      
      return {
        hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed,
        success: receipt.status === "success",
      };
    } catch (error) {
      return handleTransactionError(error, "setting approval for all");
    }
  };

  const transferFrom = async (from: Address, to: Address, tokenId: bigint): Promise<TransactionResult> => {
    if (!walletClient || !publicClient) {
      return handleTransactionError(new Error("Wallet not connected"), "transferring token");
    }

    try {
      const { request } = await publicClient.simulateContract({
        address: CONTRACT_ADDRESSES.ownership,
        abi: OWNERSHIP_ABI,
        functionName: "transferFrom",
        args: [from, to, tokenId],
        account: walletClient.account!,
      });

      const hash = await walletClient.writeContract(request);
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      
      return {
        hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed,
        success: receipt.status === "success",
      };
    } catch (error) {
      return handleTransactionError(error, "transferring token");
    }
  };

  const isApprovedForAll = async (owner: Address, operator: Address): Promise<boolean> => {
    if (!publicClient) {
      throw new Error("Public client not available");
    }

    const result = await publicClient.readContract({
      address: CONTRACT_ADDRESSES.ownership,
      abi: OWNERSHIP_ABI,
      functionName: "isApprovedForAll",
      args: [owner, operator],
    });
    
    return result as boolean;
  };

  const getApproved = async (tokenId: bigint): Promise<Address> => {
    if (!publicClient) {
      throw new Error("Public client not available");
    }

    const result = await publicClient.readContract({
      address: CONTRACT_ADDRESSES.ownership,
      abi: OWNERSHIP_ABI,
      functionName: "getApproved",
      args: [tokenId],
    });
    
    return result as Address;
  };

  const getTokenInfo = async (tokenId: bigint): Promise<TokenInfo> => {
    if (!publicClient) {
      throw new Error("Public client not available");
    }

    const [owner, creator] = await Promise.all([
      ownerOf(tokenId),
      publicClient.readContract({
        address: CONTRACT_ADDRESSES.ownership,
        abi: OWNERSHIP_ABI,
        functionName: "creators",
        args: [tokenId],
      }),
    ]);

    return {
      tokenId,
      owner,
      creator: creator as Address,
    };
  };

  const value: ContractsContextValue = {
    isConnected,
    address,
    contractAddresses: CONTRACT_ADDRESSES,
    
    // GameHub functions
    buyChance,
    withdrawEarnings,
    getCreatorEarnings,
    
    // Marketplace functions
    listItem,
    buyItem,
    cancelListing,
    getListing,
    
    // Ownership functions
    mint,
    ownerOf,
    balanceOf,
    totalMinted,
    tokensOfOwner,
    approve,
    setApprovalForAll,
    transferFrom,
    getTokenInfo,
    isApprovedForAll,
    getApproved,
  };

  return (
    <ContractsContext.Provider value={value}>
      {children}
    </ContractsContext.Provider>
  );
}

// Custom hook to use the contracts context
export function useContracts() {
  const context = useContext(ContractsContext);
  if (context === undefined) {
    throw new Error('useContracts must be used within a ContractsProvider');
  }
  return context;
}

export type { ContractsContextValue, TransactionResult, Listing, TokenInfo, ContractAddresses };