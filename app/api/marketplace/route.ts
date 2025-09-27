import { type NextRequest, NextResponse } from "next/server";
import { type Game, gameService } from "@/lib/game-service";
import { marketplaceService } from "@/lib/marketplace-service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "nft"; // "nft" for NFT listings, "published" for published games
    const page = Number.parseInt(searchParams.get("page") || "1", 10);
    const limit = Number.parseInt(searchParams.get("limit") || "20", 10);
    const search = searchParams.get("search");

    if (type === "nft") {
      // Return NFT marketplace listings
      const listings = await marketplaceService.getListingsWithGameData();
      
      // Apply search filter if provided
      let filteredListings = listings;
      if (search) {
        const searchLower = search.toLowerCase();
        filteredListings = listings.filter(listing => 
          listing.game?.title.toLowerCase().includes(searchLower) ||
          listing.game?.description?.toLowerCase().includes(searchLower) ||
          listing.game?.tags?.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }

      // Apply pagination
      const skip = (page - 1) * limit;
      const paginatedListings = filteredListings.slice(skip, skip + limit);

      return NextResponse.json({
        success: true,
        listings: paginatedListings,
        total: filteredListings.length,
        page,
        limit,
        type: "nft",
      });
    } else {
      // Return traditional published games (legacy)
      const skip = (page - 1) * limit;
      
      let games: Game[] = [];
      if (search) {
        games = await gameService.searchGames(search, "marketplace");
      } else {
        games = await gameService.getMarketplaceGames(limit, skip);
      }

      return NextResponse.json({
        success: true,
        games,
        page,
        limit,
        type: "published",
      });
    }
  } catch (error) {
    console.error("Marketplace API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch marketplace data" },
      { status: 500 }
    );
  }
}
