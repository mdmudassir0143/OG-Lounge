# 🚀 Alchemy Sepolia Setup Guide

## 1. Get Your Free Alchemy API Key

1. **Sign up**: https://dashboard.alchemy.com/signup/
2. **Create App**: 
   - Name: "Gamie Sepolia"
   - Network: Ethereum Sepolia
   - Description: "Game marketplace deployment"
3. **Copy API Key** from the dashboard

## 2. Update .env File

Replace `YOUR_ALCHEMY_API_KEY` in your `.env` file with your actual API key:

```
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ACTUAL_API_KEY_HERE
```

## 3. Deploy Your Contract

```bash
npx hardhat ignition deploy ./ignition/modules/GameMarketplace.ts --network sepolia
```

## 4. View on Block Explorer

Once deployed, view your contract at:
```
https://sepolia.etherscan.io/address/[CONTRACT_ADDRESS]
```

## Your Wallet Details
- **Address**: 0x3F8972D11d4D9D21DeF0cd645114759a2Ef6Ffe1
- **Balance**: 0.0488 ETH ✅ (Ready to deploy!)
- **Explorer**: https://sepolia.etherscan.io/address/0x3F8972D11d4D9D21DeF0cd645114759a2Ef6Ffe1

## Alchemy Resources
- **Faucet**: https://faucets.alchemy.com/faucets/ethereum-sepolia
- **Dashboard**: https://dashboard.alchemy.com/
- **Docs**: https://docs.alchemy.com/

## Network Details
- **Chain ID**: 11155111
- **Block Time**: 12-15 seconds
- **Explorer**: https://sepolia.etherscan.io/