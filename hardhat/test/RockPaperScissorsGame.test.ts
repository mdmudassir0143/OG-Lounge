import { expect } from "chai";
import hre from "hardhat";
import { ethers } from "ethers";
import { RockPaperScissorsGame } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("RockPaperScissorsGame", function () {
  let contract: RockPaperScissorsGame;
  let owner: HardhatEthersSigner;
  let player1: HardhatEthersSigner;
  let player2: HardhatEthersSigner;
  let pythAddress: string;

  const BET_AMOUNT = ethers.parseEther("0.1");
  const Choice = { None: 0, Rock: 1, Paper: 2, Scissors: 3 };
  const GameResult = { Pending: 0, Player1Wins: 1, Player2Wins: 2, Draw: 3, Expired: 4 };

  beforeEach(async function () {
    [owner, player1, player2] = await hre.ethers.getSigners();

    // Use a mock Pyth address for testing
    pythAddress = "0x4305FB66699C3B2702D4d05CF36551390A4c69C6";

    // Deploy the contract
    const RockPaperScissorsGame = await hre.ethers.getContractFactory("RockPaperScissorsGame");
    contract = await RockPaperScissorsGame.deploy(pythAddress);
    await contract.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await contract.owner()).to.equal(owner.address);
    });

    it("Should set correct constants", async function () {
      expect(await contract.MIN_BET_AMOUNT()).to.equal(ethers.parseEther("0.001"));
      expect(await contract.MAX_BET_AMOUNT()).to.equal(ethers.parseEther("10"));
    });
  });

  describe("Game Creation", function () {
    it("Should create a game with valid bet amount", async function () {
      await expect(contract.connect(player1).createGame({ value: BET_AMOUNT }))
        .to.emit(contract, "GameCreated")
        .withArgs(1, player1.address, BET_AMOUNT);

      const game = await contract.getGame(1);
      expect(game.player1).to.equal(player1.address);
      expect(game.betAmount).to.equal(BET_AMOUNT);
      expect(game.result).to.equal(GameResult.Pending);
    });

    it("Should reject bet amount below minimum", async function () {
      const lowBet = ethers.parseEther("0.0001");
      await expect(
        contract.connect(player1).createGame({ value: lowBet })
      ).to.be.revertedWith("Bet amount too low");
    });

    it("Should reject bet amount above maximum", async function () {
      const highBet = ethers.parseEther("15");
      await expect(
        contract.connect(player1).createGame({ value: highBet })
      ).to.be.revertedWith("Bet amount too high");
    });
  });

  describe("Joining Games", function () {
    beforeEach(async function () {
      // Player 1 creates a game
      await contract.connect(player1).createGame({ value: BET_AMOUNT });
    });

    it("Should allow second player to join with matching bet", async function () {
      await expect(contract.connect(player2).joinGame(1, { value: BET_AMOUNT }))
        .to.emit(contract, "PlayerJoined")
        .withArgs(1, player2.address);

      const game = await contract.getGame(1);
      expect(game.player2).to.equal(player2.address);
      expect(game.commitDeadline).to.be.greaterThan(0);
    });

    it("Should reject joining with wrong bet amount", async function () {
      const wrongBet = ethers.parseEther("0.05");
      await expect(
        contract.connect(player2).joinGame(1, { value: wrongBet })
      ).to.be.revertedWith("Must match the bet amount");
    });

    it("Should reject self-play", async function () {
      await expect(
        contract.connect(player1).joinGame(1, { value: BET_AMOUNT })
      ).to.be.revertedWith("Cannot play against yourself");
    });
  });

  describe("Commit-Reveal Pattern", function () {
    let gameId: number;
    let player1Choice: number;
    let player2Choice: number;
    let player1Nonce: number;
    let player2Nonce: number;

    beforeEach(async function () {
      gameId = 1;
      player1Choice = Choice.Rock;
      player2Choice = Choice.Paper;
      player1Nonce = 12345;
      player2Nonce = 67890;

      // Create and join game
      await contract.connect(player1).createGame({ value: BET_AMOUNT });
      await contract.connect(player2).joinGame(gameId, { value: BET_AMOUNT });
    });

    it("Should allow players to commit choices", async function () {
      const player1Hash = await contract.generateCommitHash(player1Choice, player1Nonce, player1.address);
      const player2Hash = await contract.generateCommitHash(player2Choice, player2Nonce, player2.address);

      await expect(contract.connect(player1).commitChoice(gameId, player1Hash))
        .to.emit(contract, "CommitSubmitted")
        .withArgs(gameId, player1.address);

      await expect(contract.connect(player2).commitChoice(gameId, player2Hash))
        .to.emit(contract, "CommitSubmitted")
        .withArgs(gameId, player2.address);

      const game = await contract.getGame(gameId);
      expect(game.revealDeadline).to.be.greaterThan(0);
      expect(game.randomSeed).to.be.greaterThan(0);
    });

    it("Should allow players to reveal choices correctly", async function () {
      // Commit phase
      const player1Hash = await contract.generateCommitHash(player1Choice, player1Nonce, player1.address);
      const player2Hash = await contract.generateCommitHash(player2Choice, player2Nonce, player2.address);

      await contract.connect(player1).commitChoice(gameId, player1Hash);
      await contract.connect(player2).commitChoice(gameId, player2Hash);

      // Reveal phase
      await expect(contract.connect(player1).revealChoice(gameId, player1Choice, player1Nonce))
        .to.emit(contract, "ChoiceRevealed")
        .withArgs(gameId, player1.address, player1Choice);

      await expect(contract.connect(player2).revealChoice(gameId, player2Choice, player2Nonce))
        .to.emit(contract, "GameCompleted");

      const game = await contract.getGame(gameId);
      expect(game.isCompleted).to.be.true;
      expect(game.result).to.equal(GameResult.Player2Wins); // Paper beats Rock
    });

    it("Should reject incorrect reveal", async function () {
      const player1Hash = await contract.generateCommitHash(player1Choice, player1Nonce, player1.address);
      await contract.connect(player1).commitChoice(gameId, player1Hash);

      // Try to reveal with wrong nonce
      await expect(
        contract.connect(player1).revealChoice(gameId, player1Choice, 99999)
      ).to.be.revertedWith("Invalid reveal");
    });
  });

  describe("Game Logic", function () {
    let gameId: number;

    beforeEach(async function () {
      gameId = 1;
      await contract.connect(player1).createGame({ value: BET_AMOUNT });
      await contract.connect(player2).joinGame(gameId, { value: BET_AMOUNT });
    });

    async function playGame(choice1: number, choice2: number) {
      const nonce1 = 12345;
      const nonce2 = 67890;

      const hash1 = await contract.generateCommitHash(choice1, nonce1, player1.address);
      const hash2 = await contract.generateCommitHash(choice2, nonce2, player2.address);

      await contract.connect(player1).commitChoice(gameId, hash1);
      await contract.connect(player2).commitChoice(gameId, hash2);

      await contract.connect(player1).revealChoice(gameId, choice1, nonce1);
      await contract.connect(player2).revealChoice(gameId, choice2, nonce2);

      return await contract.getGame(gameId);
    }

    it("Should determine Rock vs Scissors correctly", async function () {
      const game = await playGame(Choice.Rock, Choice.Scissors);
      expect(game.result).to.equal(GameResult.Player1Wins);
    });

    it("Should determine Paper vs Rock correctly", async function () {
      const game = await playGame(Choice.Paper, Choice.Rock);
      expect(game.result).to.equal(GameResult.Player1Wins);
    });

    it("Should determine Scissors vs Paper correctly", async function () {
      const game = await playGame(Choice.Scissors, Choice.Paper);
      expect(game.result).to.equal(GameResult.Player1Wins);
    });

    it("Should determine draw correctly", async function () {
      const game = await playGame(Choice.Rock, Choice.Rock);
      expect(game.result).to.equal(GameResult.Draw);
    });
  });

  describe("Fund Distribution", function () {
    let gameId: number;

    beforeEach(async function () {
      gameId = 1;
      await contract.connect(player1).createGame({ value: BET_AMOUNT });
      await contract.connect(player2).joinGame(gameId, { value: BET_AMOUNT });
    });

    it("Should distribute funds to winner", async function () {
      const nonce1 = 12345;
      const nonce2 = 67890;

      const hash1 = await contract.generateCommitHash(Choice.Rock, nonce1, player1.address);
      const hash2 = await contract.generateCommitHash(Choice.Scissors, nonce2, player2.address);

      await contract.connect(player1).commitChoice(gameId, hash1);
      await contract.connect(player2).commitChoice(gameId, hash2);

      await contract.connect(player1).revealChoice(gameId, Choice.Rock, nonce1);
      await contract.connect(player2).revealChoice(gameId, Choice.Scissors, nonce2);

      // Player 1 should win and get 2x bet amount
      const player1Balance = await contract.getPlayerBalance(player1.address);
      expect(player1Balance).to.equal(BET_AMOUNT * 2n);

      const player2Balance = await contract.getPlayerBalance(player2.address);
      expect(player2Balance).to.equal(0);
    });

    it("Should return funds on draw", async function () {
      const nonce1 = 12345;
      const nonce2 = 67890;

      const hash1 = await contract.generateCommitHash(Choice.Rock, nonce1, player1.address);
      const hash2 = await contract.generateCommitHash(Choice.Rock, nonce2, player2.address);

      await contract.connect(player1).commitChoice(gameId, hash1);
      await contract.connect(player2).commitChoice(gameId, hash2);

      await contract.connect(player1).revealChoice(gameId, Choice.Rock, nonce1);
      await contract.connect(player2).revealChoice(gameId, Choice.Rock, nonce2);

      // Both players should get their bet back
      const player1Balance = await contract.getPlayerBalance(player1.address);
      expect(player1Balance).to.equal(BET_AMOUNT);

      const player2Balance = await contract.getPlayerBalance(player2.address);
      expect(player2Balance).to.equal(BET_AMOUNT);
    });
  });

  describe("Withdrawals", function () {
    it("Should allow players to withdraw their balance", async function () {
      // Create and complete a game where player1 wins
      await contract.connect(player1).createGame({ value: BET_AMOUNT });
      await contract.connect(player2).joinGame(1, { value: BET_AMOUNT });

      const nonce1 = 12345;
      const nonce2 = 67890;

      const hash1 = await contract.generateCommitHash(Choice.Rock, nonce1, player1.address);
      const hash2 = await contract.generateCommitHash(Choice.Scissors, nonce2, player2.address);

      await contract.connect(player1).commitChoice(1, hash1);
      await contract.connect(player2).commitChoice(1, hash2);

      await contract.connect(player1).revealChoice(1, Choice.Rock, nonce1);
      await contract.connect(player2).revealChoice(1, Choice.Scissors, nonce2);

      // Check initial balance
      const initialBalance = await hre.ethers.provider.getBalance(player1.address);

      // Withdraw
      await expect(contract.connect(player1).withdrawBalance())
        .to.emit(contract, "FundsWithdrawn")
        .withArgs(player1.address, BET_AMOUNT * 2n);

      // Check final balance increased
      const finalBalance = await hre.ethers.provider.getBalance(player1.address);
      expect(finalBalance).to.be.greaterThan(initialBalance);

      // Balance in contract should be 0
      const contractBalance = await contract.getPlayerBalance(player1.address);
      expect(contractBalance).to.equal(0);
    });
  });

  describe("Utility Functions", function () {
    it("Should generate consistent commit hashes", async function () {
      const choice = Choice.Rock;
      const nonce = 12345;
      const player = player1.address;

      const hash1 = await contract.generateCommitHash(choice, nonce, player);
      const hash2 = await contract.generateCommitHash(choice, nonce, player);

      expect(hash1).to.equal(hash2);
    });

    it("Should generate different hashes for different inputs", async function () {
      const hash1 = await contract.generateCommitHash(Choice.Rock, 12345, player1.address);
      const hash2 = await contract.generateCommitHash(Choice.Paper, 12345, player1.address);
      const hash3 = await contract.generateCommitHash(Choice.Rock, 67890, player1.address);

      expect(hash1).to.not.equal(hash2);
      expect(hash1).to.not.equal(hash3);
      expect(hash2).to.not.equal(hash3);
    });
  });
});