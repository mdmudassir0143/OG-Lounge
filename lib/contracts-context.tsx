'use client';

import React, { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { parseEther, type Address, type Hash } from 'viem';

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

interface ContractsContextValue {
  isConnected: boolean;
  address?: Address;
  
  contractAddresses: ContractAddresses;
  
  buyChance: (numberOfChances: number, gameNftID: bigint) => Promise<TransactionResult>;
  withdrawEarnings: () => Promise<TransactionResult>;
  getCreatorEarnings: (creatorAddress: Address) => Promise<bigint>;
  createGameNFT: (to: Address, paymentValue?: bigint) => Promise<TransactionResult>;
  playGame: (tokenId: bigint) => Promise<TransactionResult>;
  getChancesPlayed: (user: Address, tokenId: bigint) => Promise<bigint>;
  getRemainingFreeChances: (user: Address, tokenId: bigint) => Promise<bigint>;
  getBoughtChances: (user: Address, tokenId: bigint) => Promise<bigint>;
  getUserTokenCount: (user: Address) => Promise<bigint>;
  getOwnership: () => Promise<Address>;
  
  listItem: (tokenId: bigint, price: bigint) => Promise<TransactionResult>;
  buyItem: (listingId: bigint, price: bigint) => Promise<TransactionResult>;
  cancelListing: (listingId: bigint) => Promise<TransactionResult>;
  getListing: (listingId: bigint) => Promise<Listing>;
  

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
  {
    type: "function",
    name: "listings",
    inputs: [{ name: "", type: "uint256" }],
    outputs: [
      { name: "seller", type: "address" },
      { name: "tokenId", type: "uint256" },
      { name: "price", type: "uint256" },
      { name: "listedAt", type: "uint256" }
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
  {
    type: "function",
    name: "createGameNFT",
    inputs: [{ name: "to", type: "address" }],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "playGame",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getChancesPlayed",
    inputs: [{ name: "user", type: "address" }, { name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getRemainingFreeChances",
    inputs: [{ name: "user", type: "address" }, { name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getBoughtChances",
    inputs: [{ name: "user", type: "address" }, { name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getUserTokenCount",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getOwnership",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
  },
] as const;

const ContractsContext = createContext<ContractsContextValue | undefined>(undefined);

const CONTRACT_ADDRESSES: ContractAddresses = {
  ownership: "0x917c08eDb26F4c471C1A178cB8Ea199798c2e048" as Address,
  marketplace: "0x8ca7cac81563f9F9A61b11cABFc14742531e82aC" as Address,
  gameHub: "0x1f9cf04d3A09D1Ce329D247aC27d55CA45a761A5" as Address
};

export function ContractsProvider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  // Initialize contract instances once with useMemo
  const contracts = useMemo(() => {
    if (!publicClient) return null;

    return {
      ownership: {
        address: CONTRACT_ADDRESSES.ownership,
        abi: OWNERSHIP_ABI,
      },
      marketplace: {
        address: CONTRACT_ADDRESSES.marketplace,
        abi: MARKETPLACE_ABI,
      },
      gameHub: {
        address: CONTRACT_ADDRESSES.gameHub,
        abi: GAMEHUB_ABI,
      },
    };
  }, [publicClient]);

  const handleTransactionError = (error: unknown, operation: string): TransactionResult => {
    console.error(`Error ${operation}:`, error);
    return {
      hash: "0x" as Hash,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  };

  const buyChance = async (numberOfChances: number, gameNftID: bigint): Promise<TransactionResult> => {
    if (!walletClient || !contracts || !publicClient) {
      return handleTransactionError(new Error("Wallet not connected or contracts not initialized"), "buying chance");
    }

    try {
      const value = parseEther((0.0001 * numberOfChances).toString());
      
      const { request } = await publicClient.simulateContract({
        ...contracts.gameHub,
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
    if (!walletClient || !contracts || !publicClient) {
      return handleTransactionError(new Error("Wallet not connected or contracts not initialized"), "withdrawing earnings");
    }

    try {
      const { request } = await publicClient.simulateContract({
        ...contracts.gameHub,
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
    if (!contracts || !publicClient) {
      throw new Error("Contracts not initialized");
    }

    const result = await publicClient.readContract({
      ...contracts.gameHub,
      functionName: "creatorEarnings",
      args: [creatorAddress],
    });
    
    return result as bigint;
  };

  const createGameNFT = async (to: Address, paymentValue?: bigint): Promise<TransactionResult> => {
    if (!walletClient || !contracts || !publicClient) {
      return handleTransactionError(new Error("Wallet not connected or contracts not initialized"), "creating game NFT");
    }

    try {
      // If no payment value is provided, check user's token count to determine if payment is needed
      let value = paymentValue;
      if (value === undefined) {
        const tokenCount = await getUserTokenCount(to);
        value = tokenCount >= BigInt(2) ? parseEther("0.0005") : BigInt(0);
      }

      const { request } = await publicClient.simulateContract({
        ...contracts.gameHub,
        functionName: "createGameNFT",
        args: [to],
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
      return handleTransactionError(error, "creating game NFT");
    }
  };

  const playGame = async (tokenId: bigint): Promise<TransactionResult> => {
    if (!walletClient || !contracts || !publicClient) {
      return handleTransactionError(new Error("Wallet not connected or contracts not initialized"), "playing game");
    }

    try {
      const { request } = await publicClient.simulateContract({
        ...contracts.gameHub,
        functionName: "playGame",
        args: [tokenId],
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
      return handleTransactionError(error, "playing game");
    }
  };

  const getChancesPlayed = async (user: Address, tokenId: bigint): Promise<bigint> => {
    if (!contracts || !publicClient) {
      throw new Error("Contracts not initialized");
    }

    const result = await publicClient.readContract({
      ...contracts.gameHub,
      functionName: "getChancesPlayed",
      args: [user, tokenId],
    });
    
    return result as bigint;
  };

  const getOwnership = async (): Promise<Address> => {
    if (!contracts || !publicClient) {
      throw new Error("Contracts not initialized");
    }

    const result = await publicClient.readContract({
      ...contracts.gameHub,
      functionName: "getOwnership",
    });
    
    return result as Address;
  };

  const getRemainingFreeChances = async (user: Address, tokenId: bigint): Promise<bigint> => {
    if (!contracts || !publicClient) {
      throw new Error("Contracts not initialized");
    }

    const result = await publicClient.readContract({
      ...contracts.gameHub,
      functionName: "getRemainingFreeChances",
      args: [user, tokenId],
    });
    
    return result as bigint;
  };

  const getBoughtChances = async (user: Address, tokenId: bigint): Promise<bigint> => {
    if (!contracts || !publicClient) {
      throw new Error("Contracts not initialized");
    }

    const result = await publicClient.readContract({
      ...contracts.gameHub,
      functionName: "getBoughtChances",
      args: [user, tokenId],
    });
    
    return result as bigint;
  };

  const getUserTokenCount = async (user: Address): Promise<bigint> => {
    if (!contracts || !publicClient) {
      throw new Error("Contracts not initialized");
    }

    const result = await publicClient.readContract({
      ...contracts.gameHub,
      functionName: "getUserTokenCount",
      args: [user],
    });
    
    return result as bigint;
  };

  const listItem = async (tokenId: bigint, price: bigint): Promise<TransactionResult> => {
    if (!walletClient || !contracts || !publicClient) {
      return handleTransactionError(new Error("Wallet not connected or contracts not initialized"), "listing item");
    }

    try {
      const { request } = await publicClient.simulateContract({
        ...contracts.marketplace,
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
    if (!walletClient || !contracts || !publicClient) {
      return handleTransactionError(new Error("Wallet not connected or contracts not initialized"), "buying item");
    }

    try {
      const { request } = await publicClient.simulateContract({
        ...contracts.marketplace,
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
    if (!walletClient || !contracts || !publicClient) {
      return handleTransactionError(new Error("Wallet not connected or contracts not initialized"), "cancelling listing");
    }

    try {
      const { request } = await publicClient.simulateContract({
        ...contracts.marketplace,
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
    if (!contracts || !publicClient) {
      throw new Error("Contracts not initialized");
    }

    const result = await publicClient.readContract({
      ...contracts.marketplace,
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

  const mint = async (to: Address): Promise<TransactionResult> => {
    if (!walletClient || !contracts || !publicClient) {
      return handleTransactionError(new Error("Wallet not connected or contracts not initialized"), "minting token");
    }

    try {
      const { request } = await publicClient.simulateContract({
        ...contracts.ownership,
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
    if (!contracts || !publicClient) {
      throw new Error("Contracts not initialized");
    }

    const result = await publicClient.readContract({
      ...contracts.ownership,
      functionName: "ownerOf",
      args: [tokenId],
    });
    
    return result as Address;
  };

  const balanceOf = async (owner: Address): Promise<bigint> => {
    if (!contracts || !publicClient) {
      throw new Error("Contracts not initialized");
    }

    const result = await publicClient.readContract({
      ...contracts.ownership,
      functionName: "balanceOf",
      args: [owner],
    });
    
    return result as bigint;
  };

  const totalMinted = async (): Promise<bigint> => {
    if (!contracts || !publicClient) {
      throw new Error("Contracts not initialized");
    }

    const result = await publicClient.readContract({
      ...contracts.ownership,
      functionName: "totalMinted",
    });
    
    return result as bigint;
  };

  const tokensOfOwner = async (owner: Address): Promise<bigint[]> => {
    if (!contracts || !publicClient) {
      throw new Error("Contracts not initialized");
    }

    const result = await publicClient.readContract({
      ...contracts.ownership,
      functionName: "tokensOfOwner",
      args: [owner],
    });
    
    return result as bigint[];
  };

  const approve = async (to: Address, tokenId: bigint): Promise<TransactionResult> => {
    if (!walletClient || !contracts || !publicClient) {
      return handleTransactionError(new Error("Wallet not connected or contracts not initialized"), "approving token");
    }

    try {
      const { request } = await publicClient.simulateContract({
        ...contracts.ownership,
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
    if (!walletClient || !contracts || !publicClient) {
      return handleTransactionError(new Error("Wallet not connected or contracts not initialized"), "setting approval for all");
    }

    try {
      const { request } = await publicClient.simulateContract({
        ...contracts.ownership,
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
    if (!walletClient || !contracts || !publicClient) {
      return handleTransactionError(new Error("Wallet not connected or contracts not initialized"), "transferring token");
    }

    try {
      const { request } = await publicClient.simulateContract({
        ...contracts.ownership,
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
    if (!contracts || !publicClient) {
      throw new Error("Contracts not initialized");
    }

    const result = await publicClient.readContract({
      ...contracts.ownership,
      functionName: "isApprovedForAll",
      args: [owner, operator],
    });
    
    return result as boolean;
  };

  const getApproved = async (tokenId: bigint): Promise<Address> => {
    if (!contracts || !publicClient) {
      throw new Error("Contracts not initialized");
    }

    const result = await publicClient.readContract({
      ...contracts.ownership,
      functionName: "getApproved",
      args: [tokenId],
    });
    
    return result as Address;
  };

  const getTokenInfo = async (tokenId: bigint): Promise<TokenInfo> => {
    if (!contracts || !publicClient) {
      throw new Error("Contracts not initialized");
    }

    const [owner, creator] = await Promise.all([
      ownerOf(tokenId),
      publicClient.readContract({
        ...contracts.ownership,
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
    
    buyChance,
    withdrawEarnings,
    getCreatorEarnings,
    createGameNFT,
    playGame,
    getChancesPlayed,
    getRemainingFreeChances,
    getBoughtChances,
    getUserTokenCount,
    getOwnership,
    
    listItem,
    buyItem,
    cancelListing,
    getListing,
    
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

export function useContracts() {
  const context = useContext(ContractsContext);
  if (context === undefined) {
    throw new Error('useContracts must be used within a ContractsProvider');
  }
  return context;
}

export type { ContractsContextValue, TransactionResult, Listing, TokenInfo, ContractAddresses };