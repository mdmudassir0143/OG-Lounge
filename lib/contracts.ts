// Contract addresses for different networks
export const CONTRACT_ADDRESSES = {
  // 0G Testnet (Chain ID: 16602) - Primary Network
  "0g-testnet": {
    GameMarketplace: "0x4D1631129dccDC63b2C3294bD76754C9E1c63cE6",
    EncryptedGameNFT: "0xb107f6825aE9E71dF31c27e23547813F4bDd7411",
    PythOracle: "0x4305FB66699C3B2702D4d05CF36551390A4c69C6",
  },
  
  // Sepolia Testnet (Chain ID: 11155111)
  sepolia: {
    GameMarketplace: "0xDb0E0812bBf50eC0Ffe434b634cC4a0503edCfaa",
    EncryptedGameNFT: "0xC08F8713412CD1097DbaFb284dFB856E634712C6",
    PythOracle: "0x4305FB66699C3B2702D4d05CF36551390A4c69C6",
  },
  
  // Local Hardhat Network (Chain ID: 31337)
  localhost: {
    GameMarketplace: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    EncryptedGameNFT: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    PythOracle: "0x4305FB66699C3B2702D4d05CF36551390A4c69C6",
  },
  
  // Ethereum Mainnet (Chain ID: 1) - for future deployment
  mainnet: {
    GameMarketplace: "", // To be deployed
    EncryptedGameNFT: "", // To be deployed
    PythOracle: "0x4305FB66699C3B2702D4d05CF36551390A4c69C6",
  }
} as const;

// Helper function to get contract address based on chain ID
export function getContractAddress(chainId: number, contractName: keyof typeof CONTRACT_ADDRESSES["0g-testnet"]) {
  switch (chainId) {
    case 16602: // 0G Testnet - Primary
      return CONTRACT_ADDRESSES["0g-testnet"][contractName];
    case 11155111: // Sepolia
      return CONTRACT_ADDRESSES.sepolia[contractName];
    case 31337: // Local Hardhat
      return CONTRACT_ADDRESSES.localhost[contractName];
    case 1: // Mainnet
      return CONTRACT_ADDRESSES.mainnet[contractName];
    default:
      // Default to 0G testnet for unknown networks
      return CONTRACT_ADDRESSES["0g-testnet"][contractName];
  }
}

// Block explorer URLs for different networks
export const BLOCK_EXPLORERS = {
  16602: "https://chainscan-galileo.0g.ai", // 0G Testnet
  11155111: "https://sepolia.etherscan.io", // Sepolia
  31337: "http://localhost:8545", // Local (no explorer)
  1: "https://etherscan.io", // Mainnet
} as const;

// Helper function to get explorer URL for NFT
export function getNFTExplorerUrl(chainId: number, contractAddress: string, tokenId: string) {
  const explorerUrl = BLOCK_EXPLORERS[chainId as keyof typeof BLOCK_EXPLORERS];
  
  if (!explorerUrl || chainId === 31337) {
    return null; // No explorer for local network
  }
  
  if (chainId === 16602) {
    // 0G testnet format
    return `${explorerUrl}/token/${contractAddress}?a=${tokenId}`;
  } else {
    // Etherscan format (Sepolia, Mainnet)
    return `${explorerUrl}/token/${contractAddress}?a=${tokenId}`;
  }
}

// Helper function to get current network chain ID
export function getCurrentChainId(): number {
  return CURRENT_NETWORK === "0g-testnet" ? 16602 : 11155111;
}

// Current network configuration (can be environment-based)
export const CURRENT_NETWORK = "0g-testnet";
export const GAME_MARKETPLACE_ADDRESS = CONTRACT_ADDRESSES["0g-testnet"].GameMarketplace;
export const ENCRYPTED_GAME_NFT_ADDRESS = CONTRACT_ADDRESSES["0g-testnet"].EncryptedGameNFT;
export const PYTH_ORACLE_ADDRESS = CONTRACT_ADDRESSES["0g-testnet"].PythOracle;