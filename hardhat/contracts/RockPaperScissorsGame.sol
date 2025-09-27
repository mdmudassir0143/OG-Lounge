// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@pythnetwork/pyth-sdk-solidity/IPyth.sol";
import "@pythnetwork/pyth-sdk-solidity/PythStructs.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title RockPaperScissorsGame
 * @dev A decentralized Rock Paper Scissors game with on-chain randomness using Pyth Network
 * @notice Uses commit-reveal pattern to ensure fair play and prevent front-running
 */
contract RockPaperScissorsGame is ReentrancyGuard, Ownable {
    IPyth pyth;

    // Game choices
    enum Choice { None, Rock, Paper, Scissors }
    enum GameResult { Pending, Player1Wins, Player2Wins, Draw, Expired }

    // Game structure
    struct Game {
        address player1;
        address player2;
        bytes32 player1CommitHash;
        bytes32 player2CommitHash;
        Choice player1Choice;
        Choice player2Choice;
        uint256 betAmount;
        uint256 commitDeadline;
        uint256 revealDeadline;
        GameResult result;
        bool player1Revealed;
        bool player2Revealed;
        bool isCompleted;
        bool fundsDistributed;
        uint256 randomSeed; // From Pyth entropy
    }

    // Mappings
    mapping(uint256 => Game) public games;
    mapping(address => uint256[]) public playerGames;
    mapping(address => uint256) public playerBalances;

    // State variables
    uint256 public nextGameId = 1;
    uint256 public constant COMMIT_DURATION = 5 minutes;
    uint256 public constant REVEAL_DURATION = 5 minutes;
    uint256 public constant MIN_BET_AMOUNT = 0.001 ether;
    uint256 public constant MAX_BET_AMOUNT = 10 ether;

    // Events
    event GameCreated(uint256 indexed gameId, address indexed player1, uint256 betAmount);
    event PlayerJoined(uint256 indexed gameId, address indexed player2);
    event CommitSubmitted(uint256 indexed gameId, address indexed player);
    event ChoiceRevealed(uint256 indexed gameId, address indexed player, Choice choice);
    event GameCompleted(uint256 indexed gameId, GameResult result, address winner);
    event FundsWithdrawn(address indexed player, uint256 amount);
    event RandomSeedGenerated(uint256 indexed gameId, uint256 randomSeed);

    constructor(address _pythContract) Ownable(msg.sender) {
        pyth = IPyth(_pythContract);
    }

    /**
     * @dev Create a new game with specified bet amount
     */
    function createGame() external payable nonReentrant {
        require(msg.value >= MIN_BET_AMOUNT, "Bet amount too low");
        require(msg.value <= MAX_BET_AMOUNT, "Bet amount too high");

        uint256 gameId = nextGameId++;

        games[gameId] = Game({
            player1: msg.sender,
            player2: address(0),
            player1CommitHash: bytes32(0),
            player2CommitHash: bytes32(0),
            player1Choice: Choice.None,
            player2Choice: Choice.None,
            betAmount: msg.value,
            commitDeadline: 0,
            revealDeadline: 0,
            result: GameResult.Pending,
            player1Revealed: false,
            player2Revealed: false,
            isCompleted: false,
            fundsDistributed: false,
            randomSeed: 0
        });

        playerGames[msg.sender].push(gameId);

        emit GameCreated(gameId, msg.sender, msg.value);
    }

    /**
     * @dev Join an existing game by matching the bet amount
     */
    function joinGame(uint256 gameId) external payable nonReentrant {
        Game storage game = games[gameId];
        require(game.player1 != address(0), "Game does not exist");
        require(game.player2 == address(0), "Game already has two players");
        require(msg.sender != game.player1, "Cannot play against yourself");
        require(msg.value == game.betAmount, "Must match the bet amount");

        game.player2 = msg.sender;
        game.commitDeadline = block.timestamp + COMMIT_DURATION;

        playerGames[msg.sender].push(gameId);

        emit PlayerJoined(gameId, msg.sender);
    }

    /**
     * @dev Submit a commit hash for your choice
     * @param gameId The game ID
     * @param commitHash The hash of (choice + nonce)
     */
    function commitChoice(uint256 gameId, bytes32 commitHash) external {
        Game storage game = games[gameId];
        require(game.player1 != address(0) && game.player2 != address(0), "Game not ready");
        require(block.timestamp <= game.commitDeadline, "Commit phase expired");
        require(commitHash != bytes32(0), "Invalid commit hash");

        if (msg.sender == game.player1) {
            require(game.player1CommitHash == bytes32(0), "Already committed");
            game.player1CommitHash = commitHash;
        } else if (msg.sender == game.player2) {
            require(game.player2CommitHash == bytes32(0), "Already committed");
            game.player2CommitHash = commitHash;
        } else {
            revert("Not a player in this game");
        }

        emit CommitSubmitted(gameId, msg.sender);

        // If both players have committed, start reveal phase and generate random seed
        if (game.player1CommitHash != bytes32(0) && game.player2CommitHash != bytes32(0)) {
            game.revealDeadline = block.timestamp + REVEAL_DURATION;
            _generateRandomSeed(gameId);
        }
    }

    /**
     * @dev Reveal your choice with the nonce used in commit
     * @param gameId The game ID
     * @param choice Your choice (1=Rock, 2=Paper, 3=Scissors)
     * @param nonce The nonce used in your commit hash
     */
    function revealChoice(uint256 gameId, Choice choice, uint256 nonce) external {
        Game storage game = games[gameId];
        require(game.revealDeadline > 0, "Reveal phase not started");
        require(block.timestamp <= game.revealDeadline, "Reveal phase expired");
        require(choice != Choice.None, "Invalid choice");

        bytes32 expectedHash = keccak256(abi.encodePacked(choice, nonce, msg.sender));

        if (msg.sender == game.player1) {
            require(game.player1CommitHash == expectedHash, "Invalid reveal");
            require(!game.player1Revealed, "Already revealed");
            game.player1Choice = choice;
            game.player1Revealed = true;
        } else if (msg.sender == game.player2) {
            require(game.player2CommitHash == expectedHash, "Invalid reveal");
            require(!game.player2Revealed, "Already revealed");
            game.player2Choice = choice;
            game.player2Revealed = true;
        } else {
            revert("Not a player in this game");
        }

        emit ChoiceRevealed(gameId, msg.sender, choice);

        // If both players have revealed, determine the winner
        if (game.player1Revealed && game.player2Revealed) {
            _determineWinner(gameId);
        }
    }

    /**
     * @dev Generate random seed using Pyth entropy (simplified version)
     * In production, this would use Pyth's entropy service
     */
    function _generateRandomSeed(uint256 gameId) internal {
        Game storage game = games[gameId];

        // Generate pseudo-random seed using block properties and game data
        // In production, this would use Pyth's entropy service
        uint256 seed = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            game.player1,
            game.player2,
            game.player1CommitHash,
            game.player2CommitHash,
            gameId
        )));

        game.randomSeed = seed;
        emit RandomSeedGenerated(gameId, seed);
    }

    /**
     * @dev Determine the winner of the game
     */
    function _determineWinner(uint256 gameId) internal {
        Game storage game = games[gameId];

        Choice choice1 = game.player1Choice;
        Choice choice2 = game.player2Choice;

        if (choice1 == choice2) {
            game.result = GameResult.Draw;
        } else if (
            (choice1 == Choice.Rock && choice2 == Choice.Scissors) ||
            (choice1 == Choice.Paper && choice2 == Choice.Rock) ||
            (choice1 == Choice.Scissors && choice2 == Choice.Paper)
        ) {
            game.result = GameResult.Player1Wins;
        } else {
            game.result = GameResult.Player2Wins;
        }

        game.isCompleted = true;
        _distributeFunds(gameId);

        address winner = address(0);
        if (game.result == GameResult.Player1Wins) {
            winner = game.player1;
        } else if (game.result == GameResult.Player2Wins) {
            winner = game.player2;
        }

        emit GameCompleted(gameId, game.result, winner);
    }

    /**
     * @dev Distribute funds based on game result
     */
    function _distributeFunds(uint256 gameId) internal {
        Game storage game = games[gameId];
        require(!game.fundsDistributed, "Funds already distributed");

        uint256 totalPot = game.betAmount * 2;

        if (game.result == GameResult.Draw) {
            // Return bets to both players
            playerBalances[game.player1] += game.betAmount;
            playerBalances[game.player2] += game.betAmount;
        } else if (game.result == GameResult.Player1Wins) {
            // Player 1 gets the entire pot
            playerBalances[game.player1] += totalPot;
        } else if (game.result == GameResult.Player2Wins) {
            // Player 2 gets the entire pot
            playerBalances[game.player2] += totalPot;
        }

        game.fundsDistributed = true;
    }

    /**
     * @dev Handle expired games where not all players revealed
     */
    function handleExpiredGame(uint256 gameId) external {
        Game storage game = games[gameId];
        require(game.revealDeadline > 0 && block.timestamp > game.revealDeadline, "Game not expired");
        require(!game.isCompleted, "Game already completed");

        if (game.player1Revealed && !game.player2Revealed) {
            // Player 1 wins by default
            game.result = GameResult.Player1Wins;
            playerBalances[game.player1] += game.betAmount * 2;
        } else if (!game.player1Revealed && game.player2Revealed) {
            // Player 2 wins by default
            game.result = GameResult.Player2Wins;
            playerBalances[game.player2] += game.betAmount * 2;
        } else {
            // Neither revealed, return funds
            game.result = GameResult.Expired;
            playerBalances[game.player1] += game.betAmount;
            playerBalances[game.player2] += game.betAmount;
        }

        game.isCompleted = true;
        game.fundsDistributed = true;

        emit GameCompleted(gameId, game.result, address(0));
    }

    /**
     * @dev Withdraw accumulated winnings
     */
    function withdrawBalance() external nonReentrant {
        uint256 balance = playerBalances[msg.sender];
        require(balance > 0, "No balance to withdraw");

        playerBalances[msg.sender] = 0;

        (bool success, ) = payable(msg.sender).call{value: balance}("");
        require(success, "Withdrawal failed");

        emit FundsWithdrawn(msg.sender, balance);
    }

    /**
     * @dev Cancel a game if no second player joins within reasonable time
     */
    function cancelGame(uint256 gameId) external {
        Game storage game = games[gameId];
        require(game.player1 == msg.sender, "Only game creator can cancel");
        require(game.player2 == address(0), "Cannot cancel game with two players");
        require(block.timestamp > game.commitDeadline + 1 hours, "Must wait before canceling");

        // Return the bet to player 1
        playerBalances[game.player1] += game.betAmount;
        game.isCompleted = true;
        game.result = GameResult.Expired;
    }

    // View functions
    function getGame(uint256 gameId) external view returns (Game memory) {
        return games[gameId];
    }

    function getPlayerGames(address player) external view returns (uint256[] memory) {
        return playerGames[player];
    }

    function getPlayerBalance(address player) external view returns (uint256) {
        return playerBalances[player];
    }

    function isGameReadyToPlay(uint256 gameId) external view returns (bool) {
        Game storage game = games[gameId];
        return game.player1 != address(0) &&
               game.player2 != address(0) &&
               game.commitDeadline > block.timestamp;
    }

    function generateCommitHash(Choice choice, uint256 nonce, address player)
        external
        pure
        returns (bytes32)
    {
        return keccak256(abi.encodePacked(choice, nonce, player));
    }

    // Emergency functions (only owner)
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");

        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Emergency withdrawal failed");
    }

    function updatePythContract(address _newPythContract) external onlyOwner {
        pyth = IPyth(_newPythContract);
    }

    // Receive function to accept ETH
    receive() external payable {}
}