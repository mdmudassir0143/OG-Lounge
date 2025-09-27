import { type NextRequest, NextResponse } from "next/server";
import {
  HTTP_STATUS_FORBIDDEN,
  HTTP_STATUS_PAYLOAD_TOO_LARGE,
  HTTP_STATUS_TOO_MANY_REQUESTS,
  HTTP_STATUS_UNAUTHORIZED,
  IPFS_UPLOAD_TIMEOUT_MS,
  MAX_FILENAME_LENGTH,
  MAX_HTML_SIZE_BYTES,
  PINATA_API_URL,
} from "@/lib/constants";
import { gameService } from "@/lib/game-service";

// Validate HTML content for fork uploads
function validateHtmlContent(htmlContent: string) {
  if (!htmlContent || htmlContent.length === 0) {
    throw new Error("HTML content is empty");
  }

  if (htmlContent.length > MAX_HTML_SIZE_BYTES) {
    throw new Error("HTML content too large (max 50MB)");
  }
}

function sanitizeTitle(title: string) {
  const safeTitle = title?.length ? title : `game_${Date.now()}`;
  return safeTitle
    .replace(/[^a-z0-9\-_]/gi, "_")
    .substring(0, MAX_FILENAME_LENGTH);
}

function buildForkFormData(
  htmlContent: string,
  title: string,
  walletAddress: string,
  originalOwner: string
) {
  const sanitizedTitle = sanitizeTitle(title);

  const formData = new FormData();
  const blob = new Blob([htmlContent], { type: "text/html" });
  formData.append("file", blob, `${sanitizedTitle}_fork.html`);

  const pinataMetadata = JSON.stringify({
    name: `${sanitizedTitle}_fork.html`,
    keyvalues: {
      type: "game",
      title,
      uploadedAt: new Date().toISOString(),
      userId: walletAddress,
      forked: "true",
      forkedFrom: originalOwner,
    },
  });
  formData.append("pinataMetadata", pinataMetadata);

  const pinataOptions = JSON.stringify({
    cidVersion: 1,
  });
  formData.append("pinataOptions", pinataOptions);

  return formData;
}

async function postToPinata(formData: FormData) {
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    IPFS_UPLOAD_TIMEOUT_MS
  );

  try {
    const response = await fetch(PINATA_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PINATA_JWT}`,
      },
      body: formData,
      signal: controller.signal,
    });

    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function parsePinataResponse(response: Response) {
  if (!response.ok) {
    const errorText = await response.text();

    if (response.status === HTTP_STATUS_UNAUTHORIZED) {
      throw new Error("Pinata authentication failed - invalid JWT token");
    }
    if (response.status === HTTP_STATUS_FORBIDDEN) {
      if (errorText.includes("NO_SCOPES_FOUND")) {
        throw new Error(
          "Pinata JWT token lacks required file upload permissions. Please update the token with proper scopes."
        );
      }
      throw new Error("Pinata access forbidden - check token permissions");
    }
    if (response.status === HTTP_STATUS_TOO_MANY_REQUESTS) {
      throw new Error("Pinata rate limit exceeded - please try again later");
    }
    if (response.status === HTTP_STATUS_PAYLOAD_TOO_LARGE) {
      throw new Error("File too large for Pinata upload");
    }
    throw new Error(
      `Pinata upload failed: ${response.status} ${response.statusText} - ${errorText}`
    );
  }

  const result = await response.json();
  const gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL || "ipfs.io";
  const ipfsUrl = `https://${gatewayUrl}/ipfs/${result.IpfsHash}`;

  return {
    cid: result.IpfsHash,
    url: ipfsUrl,
    size: result.PinSize,
  };
}

// Upload forked game to IPFS with robust error handling
async function uploadToIPFS(
  htmlContent: string,
  title: string,
  walletAddress: string,
  originalOwner: string
) {
  try {
    await validateHtmlContent(htmlContent);

    const formData = buildForkFormData(
      htmlContent,
      title,
      walletAddress,
      originalOwner
    );

    const response = await postToPinata(formData);

    return await parsePinataResponse(response);
  } catch (error) {
    if (
      error instanceof Error &&
      (error.name === "AbortError" || error.name === "DOMException")
    ) {
      throw new Error("Upload timeout - please try again");
    }

    if (error instanceof Error) {
      throw new Error(`Failed to upload fork to IPFS: ${error.message}`);
    }

    throw new Error("Failed to upload fork to IPFS: Unknown error");
  }
}

export async function POST(request: NextRequest) {
  try {
    const { originalGameId, walletAddress, newTitle } = await request.json();

    if (!(originalGameId && walletAddress)) {
      return NextResponse.json(
        { error: "Missing required fields: originalGameId, walletAddress" },
        { status: 400 }
      );
    }

    // Get original game
    const originalGame = await gameService.getGameById(originalGameId);
    if (!originalGame) {
      return NextResponse.json(
        { error: "Original game not found" },
        { status: 404 }
      );
    }

    const latestVersion = originalGame.versions.at(-1);
    if (!latestVersion) {
      return NextResponse.json(
        { error: "No versions found for original game" },
        { status: 400 }
      );
    }

    // Upload the forked game HTML to IPFS with new CID
    const forkTitle = newTitle || `${originalGame.title} (Fork)`;
    const ipfsResult = await uploadToIPFS(
      latestVersion.html,
      forkTitle,
      walletAddress,
      originalGame.walletAddress
    );

    if (!ipfsResult?.cid) {
      return NextResponse.json(
        { error: "Failed to upload forked game to IPFS" },
        { status: 500 }
      );
    }

    // Fork the game with new IPFS data
    const forkedGame = await gameService.forkGameWithIPFS(
      originalGameId,
      walletAddress,
      forkTitle,
      ipfsResult
    );

    if (!forkedGame) {
      return NextResponse.json(
        { error: "Failed to create forked game in database" },
        { status: 500 }
      );
    }

    // Update the newly created forked game's originalOwner
    try {
      await gameService.updateGame(forkedGame.gameId, {
        originalOwner: originalGame.walletAddress,
      });
    } catch {
      // Don't fail the entire request for this non-critical update
    }

    return NextResponse.json({
      success: true,
      game: forkedGame,
      ipfs: ipfsResult,
      message: "Game forked and uploaded to IPFS successfully!",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fork game" },
      { status: 500 }
    );
  }
}
