import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";

const deployEncryptedGameNFT: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { getNamedAccounts, deployments, network } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  log("\n🚀 Deploying EncryptedGameNFT contract...");

  // Network-specific configurations
  const networkConfig: { [key: string]: { pythContract: string; oracleAddress: string } } = {
    localhost: {
      pythContract: "0x4305FB66699C3B2702D4d05CF36551390A4c69C6", // Mock Pyth for local testing
      oracleAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", // Local test oracle
    },
    sepolia: {
      pythContract: "0xDd24F84d36BF92C65F92307595335bdFab5Bbd21", // Sepolia Pyth Network
      oracleAddress: "0x0000000000000000000000000000000000000000", // Will be set after deployment
    },
    mainnet: {
      pythContract: "0x4305FB66699C3B2702D4d05CF36551390A4c69C6", // Mainnet Pyth Network
      oracleAddress: "0x0000000000000000000000000000000000000000", // Production oracle
    },
    // 0G Network configurations
    "0g-testnet": {
      pythContract: "0x4305FB66699C3B2702D4d05CF36551390A4c69C6", // 0G Testnet Pyth
      oracleAddress: "0x0000000000000000000000000000000000000000", // 0G Oracle
    }
  };

  const currentNetwork = network.name;
  const config = networkConfig[currentNetwork] || networkConfig.localhost;

  // Platform wallet (deployer for now, can be changed later)
  const platformWallet = deployer;

  log(`Network: ${currentNetwork}`);
  log(`Deployer: ${deployer}`);
  log(`Platform Wallet: ${platformWallet}`);
  log(`Pyth Contract: ${config.pythContract}`);
  log(`Oracle Address: ${config.oracleAddress}`);

  // Deploy the contract
  const deployResult = await deploy("EncryptedGameNFT", {
    from: deployer,
    args: [
      config.pythContract,    // Pyth Network contract
      platformWallet,         // Platform wallet for fees
      config.oracleAddress    // Oracle address for secure transfers
    ],
    log: true,
    autoMine: true,
  });

  if (deployResult.newlyDeployed) {
    log(`✅ EncryptedGameNFT deployed at: ${deployResult.address}`);
    log(`📊 Gas used: ${deployResult.receipt?.gasUsed?.toString()}`);

    // Verify contract if not on localhost
    if (currentNetwork !== "localhost" && currentNetwork !== "hardhat") {
      log("\n📋 Verifying contract on Etherscan...");
      try {
        await hre.run("verify:verify", {
          address: deployResult.address,
          constructorArguments: [
            config.pythContract,
            platformWallet,
            config.oracleAddress
          ],
        });
        log("✅ Contract verified successfully!");
      } catch (error) {
        log("❌ Verification failed:", error);
      }
    }

    // Set up initial configuration if needed
    const contract = await ethers.getContractAt("EncryptedGameNFT", deployResult.address);
    
    log("\n⚙️ Initial contract setup...");
    
    // If oracle address is not set (zero address), log a warning
    if (config.oracleAddress === "0x0000000000000000000000000000000000000000") {
      log("⚠️ WARNING: Oracle address not configured. Set it using setOracleAddress()");
    }

    // Log important contract information
    log("\n📋 Contract Information:");
    log(`Contract Address: ${deployResult.address}`);
    log(`Pyth Contract: ${await contract.pythContract()}`);
    log(`Platform Wallet: ${await contract.platformWallet()}`);
    log(`Oracle Address: ${await contract.oracleAddress()}`);
    log(`Platform Fee: ${await contract.PLATFORM_FEE()} basis points (${(await contract.PLATFORM_FEE()).toNumber() / 100}%)`);
    log(`Max Royalty: ${await contract.MAX_ROYALTY()} basis points (${(await contract.MAX_ROYALTY()).toNumber() / 100}%)`);

    // Save deployment info for frontend integration
    const deploymentInfo = {
      network: currentNetwork,
      address: deployResult.address,
      pythContract: config.pythContract,
      platformWallet: platformWallet,
      oracleAddress: config.oracleAddress,
      deployedAt: new Date().toISOString(),
      txHash: deployResult.transactionHash,
    };

    // Write deployment info to a file for frontend integration
    const fs = require('fs');
    const path = require('path');
    
    const deploymentsDir = path.join(__dirname, '../deployments');
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }
    
    const deploymentFile = path.join(deploymentsDir, `encrypted-game-nft-${currentNetwork}.json`);
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    
    log(`💾 Deployment info saved to: ${deploymentFile}`);

    log("\n🎉 Deployment completed successfully!");
    log("\n📝 Next steps:");
    log("1. Update frontend contract configuration");
    log("2. Set oracle address if not configured");
    log("3. Test minting and purchasing functions");
    log("4. Deploy 0G Oracle infrastructure for production");
  }

  return deployResult;
};

export default deployEncryptedGameNFT;
deployEncryptedGameNFT.tags = ["EncryptedGameNFT", "NFT", "Game"];