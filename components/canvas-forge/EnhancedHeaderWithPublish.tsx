"use client";

import { Code, Download, Share2, Store, Users, Zap } from "lucide-react";
import React from "react";
import { toast } from "sonner";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import type { GenerateGameCodeOutput } from "@/types/ai-sdk";
import { EnhancedGameGeneratorDialog } from "./EnhancedGameGeneratorDialog";

type EnhancedHeaderProps = {
  onGenerate: (output: GenerateGameCodeOutput) => void;
  onExport: () => void;
  onShare: () => void;
  html: string;
  isGameGenerated: boolean;
  gameId?: string;
  title?: string;
};

export function EnhancedHeader({
  onGenerate,
  onExport,
  onShare,
  html,
  isGameGenerated,
  gameId,
  title,
}: EnhancedHeaderProps) {
  const [isPublishing, setIsPublishing] = React.useState(false);

  const { address: walletAddress } = useAccount();

  const validatePublishInputs = () => {
    if (!(gameId && title && html)) {
      toast.error("Please save your game first before publishing");
      return null;
    }

    if (!walletAddress) {
      toast.error("Wallet address not configured");
      return null;
    }

    return {
      walletAddress,
      gameId,
      title,
      html,
    };
  };

  const publishGame = async (payload: {
    gameId: string;
    type: "marketplace" | "community";
    walletAddress: string;
    version: number;
  }) => {
    const response = await fetch("/api/games/publish", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      throw new Error(
        errorBody?.error || response.statusText || "Failed to publish"
      );
    }

    return response.json();
  };

  const publishAndNotify = async (
    payload: {
      gameId: string;
      type: "marketplace" | "community";
      walletAddress: string;
      version: number;
    },
    gameTitle: string
  ) => {
    setIsPublishing(true);
    try {
      const result = await publishGame(payload);

      if (result.success) {
        toast.success(
          `Successfully published to ${payload.type === "marketplace" ? "Marketplace" : "Community"}!`,
          {
            description: `Your game "${gameTitle}" is now available for ${payload.type === "marketplace" ? "players" : "the community to fork and improve"}.`,
          }
        );
      } else {
        throw new Error(result.error || "Failed to publish");
      }
    } catch (error) {
      toast.error("Failed to publish game", {
        description:
          error instanceof Error ? error.message : "Please try again later.",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const handlePublish = async (type: "marketplace" | "community") => {
    const validated = validatePublishInputs();
    if (!validated) {
      return;
    }

    await publishAndNotify(
      {
        gameId: validated.gameId,
        type,
        walletAddress: validated.walletAddress,
        version: 1, // TODO: Get actual version
      },
      validated.title
    );
  };

  const iconClass = "mr-2 h-4 w-4 drop-shadow-[0_0_2px_hsl(var(--accent))]";
  const buttonClass =
    "transition-all hover:text-accent hover:drop-shadow-[0_0_4px_hsl(var(--accent))]";

  return (
    <header className="flex h-16 items-center justify-between p-4">
      <div className="flex items-center gap-2">
        <Code className="h-8 w-8 text-primary drop-shadow-[0_0_5px_hsl(var(--primary))]" />
        <h1 className="font-bold text-2xl text-gray-100 tracking-tighter">
          CanvasForge
          <span className="ml-2 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-sm text-transparent">
            AI Enhanced
          </span>
        </h1>
        {title && (
          <>
            <span className="mx-2 text-muted-foreground">•</span>
            <span className="font-medium text-gray-200 text-lg">{title}</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* AI Generator Dialog */}
        <EnhancedGameGeneratorDialog
          html={html}
          isGameGenerated={isGameGenerated}
          onGenerate={onGenerate}
        >
          <Button className={buttonClass} variant="ghost">
            <Zap className={iconClass} />
            {isGameGenerated ? "Enhance Game" : "Generate Game"}
          </Button>
        </EnhancedGameGeneratorDialog>

        {/* Publish to Marketplace Button */}
        {isGameGenerated && (
          <Button
            className={`${buttonClass} text-green-400 hover:text-green-300`}
            disabled={isPublishing}
            onClick={() => handlePublish("marketplace")}
            variant="ghost"
          >
            <Store className={iconClass} />
            Marketplace
          </Button>
        )}

        {/* Publish to Community Button */}
        {isGameGenerated && (
          <Button
            className={`${buttonClass} text-blue-400 hover:text-blue-300`}
            disabled={isPublishing}
            onClick={() => handlePublish("community")}
            variant="ghost"
          >
            <Users className={iconClass} />
            Community
          </Button>
        )}

        <Button className={buttonClass} onClick={onShare} variant="ghost">
          <Share2 className={iconClass} />
          Share
        </Button>

        <Button className={buttonClass} onClick={onExport} variant="ghost">
          <Download className={iconClass} />
          Export
        </Button>
      </div>
    </header>
  );
}
