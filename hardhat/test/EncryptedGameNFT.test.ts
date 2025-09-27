import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.connect();

describe("EncryptedGameNFT", function () {
  let encryptedGameNFT: any;
  let owner: any;
  let creator: any;
  let buyer: any;
  let platformWallet: any;
  let oracle: any;

  beforeEach(async function () {
    // Get signers
    [owner, creator, buyer, platformWallet, oracle] = await ethers.getSigners();

    // Deploy contract
    const EncryptedGameNFT = await ethers.getContractFactory("EncryptedGameNFT");
    encryptedGameNFT = await EncryptedGameNFT.deploy(
      "0x4305FB66699C3B2702D4d05CF36551390A4c69C6", // Mock Pyth contract
      platformWallet.address,
      oracle.address
    );
    await encryptedGameNFT.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct name and symbol", async function () {
      expect(await encryptedGameNFT.name()).to.equal("Encrypted Game NFT");
      expect(await encryptedGameNFT.symbol()).to.equal("EGNFT");
    });

    it("Should set the correct platform wallet", async function () {
      expect(await encryptedGameNFT.platformWallet()).to.equal(platformWallet.address);
    });

    it("Should set the correct oracle address", async function () {
      expect(await encryptedGameNFT.oracleAddress()).to.equal(oracle.address);
    });

    it("Should initialize with zero total supply", async function () {
      expect(await encryptedGameNFT.totalSupply()).to.equal(0);
    });
  });

  describe("Game NFT Minting", function () {
    it("Should mint a new encrypted game NFT", async function () {
      const title = "Test Game";
      const description = "A test encrypted game";
      const priceUSD = 500; // $5.00
      const encryptedMetadataURI = "ipfs://QmTestHash123";
      const metadataHash = ethers.keccak256(ethers.toUtf8Bytes("test_metadata"));
      const royaltyPercentage = 500; // 5%

      await expect(
        encryptedGameNFT.connect(creator).mintGameNFT(
          title,
          description,
          priceUSD,
          encryptedMetadataURI,
          metadataHash,
          royaltyPercentage
        )
      ).to.emit(encryptedGameNFT, "GameNFTMinted");

      expect(await encryptedGameNFT.totalSupply()).to.equal(1);
      expect(await encryptedGameNFT.ownerOf(1)).to.equal(creator.address);
    });

    it("Should reject minting with empty title", async function () {
      await expect(
        encryptedGameNFT.connect(creator).mintGameNFT(
          "", // Empty title
          "Description",
          500,
          "ipfs://test",
          ethers.keccak256(ethers.toUtf8Bytes("test")),
          500
        )
      ).to.be.revertedWith("Title cannot be empty");
    });

    it("Should reject minting with zero price", async function () {
      await expect(
        encryptedGameNFT.connect(creator).mintGameNFT(
          "Title",
          "Description",
          0, // Zero price
          "ipfs://test",
          ethers.keccak256(ethers.toUtf8Bytes("test")),
          500
        )
      ).to.be.revertedWith("Price must be greater than 0");
    });

    it("Should reject minting with excessive royalty", async function () {
      await expect(
        encryptedGameNFT.connect(creator).mintGameNFT(
          "Title",
          "Description",
          500,
          "ipfs://test",
          ethers.keccak256(ethers.toUtf8Bytes("test")),
          1500 // 15% - exceeds maximum
        )
      ).to.be.revertedWith("Royalty too high");
    });
  });

  describe("Game Details", function () {
    beforeEach(async function () {
      // Mint a test game
      await encryptedGameNFT.connect(creator).mintGameNFT(
        "Test Game",
        "A test encrypted game",
        500,
        "ipfs://QmTestHash123",
        ethers.keccak256(ethers.toUtf8Bytes("test_metadata")),
        750 // 7.5%
      );
    });

    it("Should return correct game details", async function () {
      const details = await encryptedGameNFT.getGameDetails(1);
      
      expect(details.title).to.equal("Test Game");
      expect(details.description).to.equal("A test encrypted game");
      expect(details.creator).to.equal(creator.address);
      expect(details.currentOwner).to.equal(creator.address);
      expect(details.priceUSD).to.equal(500);
      expect(details.isListed).to.be.true;
      expect(details.royaltyPercentage).to.equal(750);
    });
  });

  describe("Marketplace Integration", function () {
    beforeEach(async function () {
      // Mint a test game
      await encryptedGameNFT.connect(creator).mintGameNFT(
        "Test Game",
        "Description",
        500,
        "ipfs://test",
        ethers.keccak256(ethers.toUtf8Bytes("test")),
        500
      );
    });

    it("Should list game on marketplace", async function () {
      const customPrice = 750; // $7.50
      
      await expect(
        encryptedGameNFT.connect(creator).listOnMarketplace(1, customPrice)
      ).to.emit(encryptedGameNFT, "GameListed")
      .withArgs(1, customPrice);

      expect(await encryptedGameNFT.marketplaceListed(1)).to.be.true;
      expect(await encryptedGameNFT.listingPrices(1)).to.equal(customPrice);
    });

    it("Should delist game from marketplace", async function () {
      // First list the game
      await encryptedGameNFT.connect(creator).listOnMarketplace(1, 750);
      
      await expect(
        encryptedGameNFT.connect(creator).delistFromMarketplace(1)
      ).to.emit(encryptedGameNFT, "GameDelisted")
      .withArgs(1);

      expect(await encryptedGameNFT.marketplaceListed(1)).to.be.false;
    });
  });

  describe("Access Control", function () {
    beforeEach(async function () {
      // Mint a test game
      await encryptedGameNFT.connect(creator).mintGameNFT(
        "Test Game",
        "Description",
        500,
        "ipfs://test",
        ethers.keccak256(ethers.toUtf8Bytes("test")),
        500
      );
    });

    it("Should grant temporary access", async function () {
      const duration = 86400; // 24 hours
      
      await expect(
        encryptedGameNFT.connect(creator).grantTemporaryAccess(1, buyer.address, duration)
      ).to.emit(encryptedGameNFT, "AccessGranted");

      expect(await encryptedGameNFT.hasMetadataAccess(1, buyer.address)).to.be.true;
    });

    it("Should only allow owner to grant access", async function () {
      const duration = 86400; // 24 hours
      
      await expect(
        encryptedGameNFT.connect(buyer).grantTemporaryAccess(1, buyer.address, duration)
      ).to.be.revertedWith("Not game owner");
    });
  });

  describe("Creator Games Tracking", function () {
    it("Should track games by creator", async function () {
      // Mint multiple games
      await encryptedGameNFT.connect(creator).mintGameNFT(
        "Game 1",
        "First game",
        500,
        "ipfs://test1",
        ethers.keccak256(ethers.toUtf8Bytes("test1")),
        500
      );
      
      await encryptedGameNFT.connect(creator).mintGameNFT(
        "Game 2",
        "Second game",
        750,
        "ipfs://test2",
        ethers.keccak256(ethers.toUtf8Bytes("test2")),
        250
      );

      const creatorGames = await encryptedGameNFT.getCreatorGames(creator.address);
      expect(creatorGames.length).to.equal(2);
      expect(creatorGames[0]).to.equal(1);
      expect(creatorGames[1]).to.equal(2);
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to update platform wallet", async function () {
      await encryptedGameNFT.connect(owner).setPlatformWallet(buyer.address);
      expect(await encryptedGameNFT.platformWallet()).to.equal(buyer.address);
    });

    it("Should not allow non-owner to update platform wallet", async function () {
      await expect(
        encryptedGameNFT.connect(buyer).setPlatformWallet(buyer.address)
      ).to.be.revertedWithCustomError(encryptedGameNFT, "OwnableUnauthorizedAccount");
    });

    it("Should allow owner to pause contract", async function () {
      await encryptedGameNFT.connect(owner).pause();
      expect(await encryptedGameNFT.paused()).to.be.true;
    });

    it("Should not allow minting when paused", async function () {
      await encryptedGameNFT.connect(owner).pause();
      
      await expect(
        encryptedGameNFT.connect(creator).mintGameNFT(
          "Test Game",
          "Description",
          500,
          "ipfs://test",
          ethers.keccak256(ethers.toUtf8Bytes("test")),
          500
        )
      ).to.be.revertedWithCustomError(encryptedGameNFT, "EnforcedPause");
    });
  });

  describe("Token URI", function () {
    it("Should return correct token URI with encrypted metadata info", async function () {
      const title = "Test Game";
      const description = "A test encrypted game";
      
      await encryptedGameNFT.connect(creator).mintGameNFT(
        title,
        description,
        500,
        "ipfs://test",
        ethers.keccak256(ethers.toUtf8Bytes("test")),
        500
      );

      const tokenURI = await encryptedGameNFT.tokenURI(1);
      const metadata = JSON.parse(tokenURI);
      
      expect(metadata.name).to.equal(title);
      expect(metadata.description).to.equal(description);
      expect(metadata.encrypted).to.be.true;
      expect(metadata.access_required).to.be.true;
    });
  });
});