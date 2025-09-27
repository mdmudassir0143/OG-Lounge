// Contract addresses for different networks
export const CONTRACT_ADDRESSES = {
  // Sepolia Testnet (Chain ID: 11155111)
  sepolia: {
    GameMarketplace: "0xcEd6d7a86848a8E8199281E5a4e8A28B1d287146",
    PythOracle: "0x4305FB66699C3B2702D4d05CF36551390A4c69C6",
  },
  
  // Local Hardhat Network (Chain ID: 31337)
  localhost: {
    GameMarketplace: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    PythOracle: "0x4305FB66699C3B2702D4d05CF36551390A4c69C6",
  },
  
  // Ethereum Mainnet (Chain ID: 1) - for future deployment
  mainnet: {
    GameMarketplace: "", // To be deployed
    PythOracle: "0x4305FB66699C3B2702D4d05CF36551390A4c69C6",
  }
} as const;

// Helper function to get contract address based on chain ID
export function getContractAddress(chainId: number, contractName: keyof typeof CONTRACT_ADDRESSES.sepolia) {
  switch (chainId) {
    case 11155111: // Sepolia
      return CONTRACT_ADDRESSES.sepolia[contractName];
    case 31337: // Local Hardhat
      return CONTRACT_ADDRESSES.localhost[contractName];
    case 1: // Mainnet
      return CONTRACT_ADDRESSES.mainnet[contractName];
    default:
      // Default to Sepolia for unknown networks
      return CONTRACT_ADDRESSES.sepolia[contractName];
  }
}

// Current network configuration (can be environment-based)
export const CURRENT_NETWORK = "sepolia";
export const GAME_MARKETPLACE_ADDRESS = CONTRACT_ADDRESSES.sepolia.GameMarketplace;
export const PYTH_ORACLE_ADDRESS = CONTRACT_ADDRESSES.sepolia.PythOracle;