## Deployment Commands for Sepolia Testnet

# 1. Deploy your GameMarketplace contract
npx hardhat ignition deploy ./ignition/modules/GameMarketplace.ts --network sepolia

# 2. The output will show your contract address like:
# GameMarketplaceModule#GameMarketplace - 0x[CONTRACT_ADDRESS]

# 3. View on Sepolia Explorer:
# https://sepolia.etherscan.io/address/0x[CONTRACT_ADDRESS]

# 4. Verify your contract (optional but recommended):
npx hardhat verify --network sepolia 0x[CONTRACT_ADDRESS]

## Your Wallet Info:
# Address: 0x3F8972D11d4D9D21DeF0cd645114759a2Ef6Ffe1
# Balance: 0.0488 ETH (sufficient for deployment)
# Private Key: Configured as WALLET_PRIVATE_KEY in .env

## Block Explorers:
# Sepolia Testnet: https://sepolia.etherscan.io/
# Ethereum Mainnet: https://etherscan.io/

## Example Explorer URLs:
# Your wallet: https://sepolia.etherscan.io/address/0x3F8972D11d4D9D21DeF0cd645114759a2Ef6Ffe1
# Your contract (once deployed): https://sepolia.etherscan.io/address/[CONTRACT_ADDRESS]