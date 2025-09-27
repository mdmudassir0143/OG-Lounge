import type { Filter } from "mongodb";
import {
  MAX_SEARCH_RESULTS,
  VERSION_ID_RANDOM_END,
  VERSION_ID_RANDOM_LENGTH,
  VERSION_ID_RANDOM_START,
} from "./constants";
import client from "./mongodb";

export type GameVersion = {
  _id?: string;
  versionId: string;
  gameId: string;
  version: number;
  html: string;
  title: string;
  description?: string;
  tags?: string[];
  ipfsCid: string; // Now required - all games must be on IPFS
  ipfsUrl: string; // Now required - all games must be on IPFS
  createdAt: Date;
  updatedAt: Date;
};

export type Game = {
  _id?: string;
  gameId: string;
  walletAddress: string;
  title: string;
  description?: string;
  tags?: string[];
  currentVersion: number;
  versions: GameVersion[];
  isPublishedToMarketplace: boolean;
  isPublishedToCommunity: boolean;
  marketplacePublishedAt?: Date;
  communityPublishedAt?: Date;
  forkCount: number;
  playCount: number;
  originalGameId?: string; // For forked games
  originalOwner?: string; // wallet address from which this game was forked
  isForSale?: boolean;
  salePrice?: number;
  listedForSaleAt?: Date;
  purchasedAt?: Date;
  previousOwner?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Publication = {
  _id?: string;
  gameId: string;
  version: number;
  type: "marketplace" | "community";
  publishedAt: Date;
  publishedBy: string; // wallet address
};

class GameService {
  private db() {
    return client.db("game-hub");
  }

  // Create a new game
  async createGame(gameData: {
    walletAddress: string;
    title: string;
    description?: string;
    tags?: string[];
    isPublishedToMarketplace?: boolean;
    isPublishedToCommunity?: boolean;
    originalGameId?: string;
    originalOwner?: string;
  }): Promise<Game> {
    const gameId = `game_${Date.now()}_${Math.random().toString(VERSION_ID_RANDOM_LENGTH).substring(VERSION_ID_RANDOM_START, VERSION_ID_RANDOM_END)}`;

    const game: Game = {
      ...gameData,
      gameId,
      playCount: 0,
      currentVersion: 0,
      versions: [],
      forkCount: 0,
      isPublishedToMarketplace: gameData.isPublishedToMarketplace ?? false,
      isPublishedToCommunity: gameData.isPublishedToCommunity ?? false,
      originalOwner: gameData.originalOwner,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await this.db().collection<Game>("games").insertOne(game);
    return { ...game, _id: result.insertedId.toString() };
  }

  // Add a new version to a game
  async addGameVersion(
    gameId: string,
    versionData: Omit<
      GameVersion,
      "_id" | "versionId" | "gameId" | "version" | "createdAt" | "updatedAt"
    >
  ): Promise<GameVersion> {
    const game = await this.getGameById(gameId);
    if (!game) {
      throw new Error("Game not found");
    }

    // Validate IPFS data is provided
    if (!(versionData.ipfsCid && versionData.ipfsUrl)) {
      throw new Error("IPFS CID and URL are required for all game versions");
    }

    const versionId = `version_${Date.now()}_${Math.random().toString(VERSION_ID_RANDOM_LENGTH).substring(VERSION_ID_RANDOM_START, VERSION_ID_RANDOM_END)}`;
    const version = game.currentVersion + 1;

    const gameVersion: GameVersion = {
      ...versionData,
      versionId,
      gameId,
      version,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Add version to game and update current version
    await this.db()
      .collection<Game>("games")
      .updateOne(
        { gameId },
        {
          $push: { versions: gameVersion },
          $set: {
            currentVersion: version,
            updatedAt: new Date(),
          },
        }
      );
    return gameVersion;
  }

  // Get all games for a wallet
  async getGamesByWallet(walletAddress: string): Promise<Game[]> {
    return await this.db()
      .collection<Game>("games")
      .find({ walletAddress })
      .sort({ updatedAt: -1 })
      .toArray();
  }

  // Get a specific game by ID
  async getGameById(gameId: string): Promise<Game | null> {
    return await this.db().collection<Game>("games").findOne({ gameId });
  }

  // Update game metadata
  async updateGame(gameId: string, updates: Partial<Game>): Promise<boolean> {
    const result = await this.db()
      .collection<Game>("games")
      .updateOne(
        { gameId },
        {
          $set: {
            ...updates,
            updatedAt: new Date(),
          },
        }
      );
    return result.matchedCount > 0;
  }

  // Publish game to marketplace
  async publishToMarketplace(
    gameId: string,
    version: number,
    walletAddress: string
  ): Promise<boolean> {
    const game = await this.getGameById(gameId);
    if (!game || game.walletAddress !== walletAddress) {
      throw new Error("Game not found or unauthorized");
    }

    // Update game publication status
    await this.db()
      .collection<Game>("games")
      .updateOne(
        { gameId },
        {
          $set: {
            isPublishedToMarketplace: true,
            marketplacePublishedAt: new Date(),
            updatedAt: new Date(),
          },
        }
      );

    // Record publication
    const publication: Publication = {
      gameId,
      version,
      type: "marketplace",
      publishedAt: new Date(),
      publishedBy: walletAddress,
    };

    await this.db()
      .collection<Publication>("publications")
      .insertOne(publication);
    return true;
  }

  // Publish game to community
  async publishToCommunity(
    gameId: string,
    version: number,
    walletAddress: string
  ): Promise<boolean> {
    const game = await this.getGameById(gameId);
    if (!game || game.walletAddress !== walletAddress) {
      throw new Error("Game not found or unauthorized");
    }

    // Update game publication status
    await this.db()
      .collection<Game>("games")
      .updateOne(
        { gameId },
        {
          $set: {
            isPublishedToCommunity: true,
            communityPublishedAt: new Date(),
            updatedAt: new Date(),
          },
        }
      );

    // Record publication
    const publication: Publication = {
      gameId,
      version,
      type: "community",
      publishedAt: new Date(),
      publishedBy: walletAddress,
    };

    await this.db()
      .collection<Publication>("publications")
      .insertOne(publication);
    return true;
  }

  // Get marketplace games
  async getMarketplaceGames(limit = 20, skip = 0): Promise<Game[]> {
    return await this.db()
      .collection<Game>("games")
      .find({ isPublishedToMarketplace: true })
      .sort({ marketplacePublishedAt: -1 })
      .limit(limit)
      .skip(skip)
      .toArray();
  }

  // Get community games
  async getCommunityGames(limit = 20, skip = 0): Promise<Game[]> {
    return await this.db()
      .collection<Game>("games")
      .find({ isPublishedToCommunity: true })
      .sort({ communityPublishedAt: -1 })
      .limit(limit)
      .skip(skip)
      .toArray();
  }

  // Fork a game with new IPFS upload
  async forkGameWithIPFS(
    originalGameId: string,
    walletAddress: string,
    newTitle: string,
    ipfsResult: { cid: string; url: string; size: number }
  ): Promise<Game> {
    const originalGame = await this.getGameById(originalGameId);
    if (!originalGame) {
      throw new Error("Original game not found");
    }

    // Increment fork count
    await this.db()
      .collection<Game>("games")
      .updateOne({ gameId: originalGameId }, { $inc: { forkCount: 1 } });

    // Get the latest version
    const latestVersion = originalGame.versions.at(-1);
    if (!latestVersion) {
      throw new Error("No versions found for original game");
    }

    // Create new game
    const forkedGame = await this.createGame({
      walletAddress,
      title: newTitle,
      description: originalGame.description,
      tags: originalGame.tags,
      isPublishedToMarketplace: false,
      isPublishedToCommunity: false,
      originalGameId,
    });

    // Add initial version with new IPFS data
    await this.addGameVersion(forkedGame.gameId, {
      html: latestVersion.html,
      title: newTitle,
      description: latestVersion.description,
      tags: latestVersion.tags,
      ipfsCid: ipfsResult.cid,
      ipfsUrl: ipfsResult.url,
    });

    return forkedGame;
  }

  // Fork a game (legacy method - kept for backward compatibility)
  async forkGame(
    originalGameId: string,
    walletAddress: string,
    newTitle?: string
  ): Promise<Game> {
    const originalGame = await this.getGameById(originalGameId);
    if (!originalGame) {
      throw new Error("Original game not found");
    }

    // Increment fork count
    await this.db()
      .collection<Game>("games")
      .updateOne({ gameId: originalGameId }, { $inc: { forkCount: 1 } });

    // Get the latest version
    const latestVersion = originalGame.versions.at(-1);
    if (!latestVersion) {
      throw new Error("No versions found for original game");
    }

    // Create new game
    const forkedGame = await this.createGame({
      walletAddress,
      title: newTitle || `${originalGame.title} (Fork)`,
      description: originalGame.description,
      tags: originalGame.tags,
      isPublishedToMarketplace: false,
      isPublishedToCommunity: false,
      originalGameId,
    });

    // Add initial version from original
    await this.addGameVersion(forkedGame.gameId, {
      html: latestVersion.html,
      title: latestVersion.title,
      description: latestVersion.description,
      tags: latestVersion.tags,
      ipfsCid: latestVersion.ipfsCid,
      ipfsUrl: latestVersion.ipfsUrl,
    });

    return forkedGame;
  }

  // Search games
  async searchGames(
    query: string,
    type?: "marketplace" | "community"
  ): Promise<Game[]> {
    let filter: Filter<Game> = {
      $or: [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { tags: { $in: [new RegExp(query, "i")] } },
      ],
    };

    if (type === "marketplace") {
      filter = { ...filter, isPublishedToMarketplace: true };
    } else if (type === "community") {
      filter = { ...filter, isPublishedToCommunity: true };
    }

    return await this.db()
      .collection<Game>("games")
      .find(filter)
      .sort({ updatedAt: -1 })
      .limit(MAX_SEARCH_RESULTS)
      .toArray();
  }

  // Delete a game (owner only)
  async deleteGame(gameId: string, walletAddress: string): Promise<boolean> {
    const game = await this.getGameById(gameId);
    if (!game) {
      throw new Error("Game not found");
    }
    if (game.walletAddress !== walletAddress) {
      throw new Error("Unauthorized: only the owner can delete this game");
    }

    // Delete game document and related publications
    const deleteResult = await this.db()
      .collection<Game>("games")
      .deleteOne({ gameId });

    await this.db()
      .collection<Publication>("publications")
      .deleteMany({ gameId });

    return deleteResult.deletedCount > 0;
  }
}

export const gameService = new GameService();
