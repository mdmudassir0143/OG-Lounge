import { expect } from "chai";
import hre from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { getAddress, parseEther, parseUnits } from "viem";

describe("GameEconomy", function () {
  // Fixture to deploy contracts
  async function deployGameEconomyFixture() {
    const [owner, user1, user2, platformWallet] = await hre.viem.getWalletClients();

    // Mock Pyth contract address (in real deployment, use actual Pyth contract)
    const mockPythAddress = "0x4305FB66699C3B2702D4d05CF36551390A4c69C6";
    
    const gameEconomy = await hre.viem.deployContract("GameEconomy", [
      mockPythAddress,
      platformWallet.account.address,
    ]);

    const publicClient = await hre.viem.getPublicClient();

    return {
      gameEconomy,
      owner,
      user1,
      user2,
      platformWallet,
      publicClient,
    };
  }

  describe("Deployment", function () {
    it("Should set the right platform wallet", async function () {
      const { gameEconomy, platformWallet } = await loadFixture(deployGameEconomyFixture);
      
      expect(await gameEconomy.read.platformWallet()).to.equal(
        getAddress(platformWallet.account.address)
      );
    });

    it("Should initialize with zero games", async function () {
      const { gameEconomy } = await loadFixture(deployGameEconomyFixture);
      
      expect(await gameEconomy.read.gameCounter()).to.equal(0n);
    });
  });

  describe("Game Registration", function () {
    it("Should register a new game", async function () {
      const { gameEconomy, owner } = await loadFixture(deployGameEconomyFixture);
      
      const metadataHash = "QmTestHash123";
      const basePriceUSD = 500; // $5.00

      await expect(
        gameEconomy.write.registerGame([metadataHash, BigInt(basePriceUSD)])
      ).to.emit(gameEconomy, "GameRegistered");

      expect(await gameEconomy.read.gameCounter()).to.equal(1n);
    });

    it("Should revert with zero price", async function () {
      const { gameEconomy } = await loadFixture(deployGameEconomyFixture);
      
      await expect(
        gameEconomy.write.registerGame(["QmTestHash", 0n])
      ).to.be.rejectedWith("Price must be greater than 0");
    });

    it("Should revert with empty metadata", async function () {
      const { gameEconomy } = await loadFixture(deployGameEconomyFixture);
      
      await expect(
        gameEconomy.write.registerGame(["", 500n])
      ).to.be.rejectedWith("Metadata hash required");
    });
  });

  describe("Game Management", function () {
    it("Should allow owner to deactivate game", async function () {
      const { gameEconomy, owner } = await loadFixture(deployGameEconomyFixture);
      
      // Register a game first
      await gameEconomy.write.registerGame(["QmTestHash", 500n]);
      
      // Deactivate the game
      await gameEconomy.write.deactivateGame([1n]);
      
      const game = await gameEconomy.read.getGame([1n]);
      expect(game[5]).to.equal(false); // isActive should be false
    });

    it("Should revert if non-owner tries to deactivate", async function () {
      const { gameEconomy, user1 } = await loadFixture(deployGameEconomyFixture);
      
      // Register a game first
      await gameEconomy.write.registerGame(["QmTestHash", 500n]);
      
      // Try to deactivate with different user
      await expect(
        gameEconomy.write.deactivateGame([1n], { account: user1.account })
      ).to.be.rejectedWith("Not game owner");
    });

    it("Should allow reactivation of deactivated game", async function () {
      const { gameEconomy } = await loadFixture(deployGameEconomyFixture);
      
      // Register and deactivate a game
      await gameEconomy.write.registerGame(["QmTestHash", 500n]);
      await gameEconomy.write.deactivateGame([1n]);
      
      // Reactivate the game
      await gameEconomy.write.reactivateGame([1n]);
      
      const game = await gameEconomy.read.getGame([1n]);
      expect(game[5]).to.equal(true); // isActive should be true
    });
  });

  describe("Owner Games Tracking", function () {
    it("Should track games by owner", async function () {
      const { gameEconomy, owner } = await loadFixture(deployGameEconomyFixture);
      
      // Register multiple games
      await gameEconomy.write.registerGame(["QmTestHash1", 500n]);
      await gameEconomy.write.registerGame(["QmTestHash2", 1000n]);
      
      const ownerGames = await gameEconomy.read.getOwnerGames([owner.account.address]);
      expect(ownerGames).to.have.length(2);
      expect(ownerGames[0]).to.equal(1n);
      expect(ownerGames[1]).to.equal(2n);
    });

    it("Should return empty array for non-owners", async function () {
      const { gameEconomy, user1 } = await loadFixture(deployGameEconomyFixture);
      
      const ownerGames = await gameEconomy.read.getOwnerGames([user1.account.address]);
      expect(ownerGames).to.have.length(0);
    });
  });

  describe("Game Details", function () {
    it("Should return correct game details", async function () {
      const { gameEconomy, owner } = await loadFixture(deployGameEconomyFixture);
      
      const metadataHash = "QmTestHash123";
      const basePriceUSD = 1500; // $15.00
      
      await gameEconomy.write.registerGame([metadataHash, BigInt(basePriceUSD)]);
      
      const game = await gameEconomy.read.getGame([1n]);
      
      expect(game[0]).to.equal(1n); // id
      expect(game[1]).to.equal(getAddress(owner.account.address)); // owner
      expect(game[2]).to.equal(metadataHash); // metadataHash
      expect(game[3]).to.equal(BigInt(basePriceUSD)); // basePriceUSD
      expect(game[5]).to.equal(true); // isActive
      expect(game[6]).to.equal(0n); // totalSales
    });
  });

  describe("Platform Configuration", function () {
    it("Should have correct platform fee", async function () {
      const { gameEconomy } = await loadFixture(deployGameEconomyFixture);
      
      expect(await gameEconomy.read.PLATFORM_FEE()).to.equal(250n); // 2.5%
    });

    it("Should have correct ETH price feed ID", async function () {
      const { gameEconomy } = await loadFixture(deployGameEconomyFixture);
      
      const expectedFeedId = "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace";
      expect(await gameEconomy.read.ETH_USD_PRICE_FEED()).to.equal(expectedFeedId);
    });
  });

  // Note: Price calculation tests would require a mock Pyth contract
  // For now, we'll focus on the contract logic that doesn't depend on external price feeds
});