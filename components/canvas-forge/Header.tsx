import {
  Bot,
  Code,
  Edit,
  Save,
  ShoppingCart,
  Store,
  XCircle,
  Zap,
} from "lucide-react";
import React from "react";
import type { GenerateGameCodeOutput } from "@/ai/flows/generate-game-code-ai-sdk";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { GameGeneratorDialog } from "./GameGeneratorDialog";
import { OwnershipFeeDialog } from "./ownership-fee-dialog";
import { SellGameDialog } from "./sell-game-dialog";

type HeaderProps = {
  onGenerate: (output: GenerateGameCodeOutput) => void;
  onSave?: () => void;
  onPublishMarketplace?: () => void;
  onSellGame?: (price: number) => Promise<void>;
  onRemoveFromSale?: () => Promise<void>;
  html: string;
  isGameGenerated: boolean;
  showPublishButtons?: boolean;
  showSellButton?: boolean;
  isSaving?: boolean;
  title?: string;
  gameId?: string;
  currentGamePrice?: number;
  isGameForSale?: boolean;
  onTitleChange?: (title: string) => void;
  isPublishedToMarketplace?: boolean;
  onUnpublish?: (type: "marketplace") => Promise<void> | void;
};

export function Header({
  onGenerate,
  onSave,
  onPublishMarketplace,
  onSellGame,
  onRemoveFromSale,
  html,
  isGameGenerated,
  showPublishButtons = false,
  showSellButton = false,
  isSaving = false,
  title,
  gameId,
  currentGamePrice,
  isGameForSale,
  onTitleChange,
  isPublishedToMarketplace = false,
  onUnpublish,
}: HeaderProps) {
  const [editing, setEditing] = React.useState(false);
  const [mcpDialogOpen, setMcpDialogOpen] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  return (
    <header className="flex h-16 items-center justify-between bg-gradient-to-r from-slate-800/50 to-transparent p-4">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 p-2">
          <Code className="h-6 w-6 text-white" />
        </div>
        <div className="flex items-center gap-2">
          {editing ? (
            <div className="flex items-center gap-2">
              <Input
                className="w-64 border-slate-600 bg-slate-700/50 text-white placeholder:text-slate-400 focus:border-blue-500"
                onChange={(e) => onTitleChange?.(e.target.value)}
                ref={inputRef}
                value={title}
              />
              <Button
                className="bg-green-600 text-white hover:bg-green-700"
                onClick={() => setEditing(false)}
                size="sm"
              >
                <Save className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <>
              <h1 className="bg-gradient-to-r from-white to-slate-300 bg-clip-text font-bold text-2xl text-transparent text-white tracking-tighter">
                {title || "CanvasForge"}
              </h1>
              <Button
                className="text-slate-400 hover:bg-slate-700/50 hover:text-white"
                onClick={() => setEditing(true)}
                size="sm"
                variant="ghost"
              >
                <Edit className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <GameGeneratorDialog
          html={html}
          isGameGenerated={isGameGenerated}
          onGenerate={onGenerate}
        >
          <Button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg transition-all duration-200 hover:from-purple-700 hover:to-blue-700 hover:shadow-xl">
            <Bot className="mr-2 h-4 w-4" />
            {isGameGenerated ? "Refine Game" : "Generate Game"}
          </Button>
        </GameGeneratorDialog>

        {/* Save Button with Ownership Fee Dialog */}
        {onSave && (
          <OwnershipFeeDialog isSaving={isSaving} onSave={onSave}>
            <Button
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg transition-all duration-200 hover:from-green-700 hover:to-emerald-700 hover:shadow-xl"
              disabled={isSaving}
            >
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </OwnershipFeeDialog>
        )}

        {/* Sell Game Button */}
        {showSellButton && onSellGame && gameId && title && (
          <SellGameDialog
            currentPrice={currentGamePrice}
            gameId={gameId}
            gameTitle={title}
            isForSale={isGameForSale}
            onRemoveFromSale={onRemoveFromSale}
            onSell={onSellGame}
          >
            <Button className="bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg transition-all duration-200 hover:from-amber-700 hover:to-orange-700 hover:shadow-xl">
              <Store className="mr-2 h-4 w-4" />
              {isGameForSale ? "Update Price" : "Sell Game"}
            </Button>
          </SellGameDialog>
        )}

        {/* MCP Button */}
        <Dialog onOpenChange={setMcpDialogOpen} open={mcpDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg transition-all duration-200 hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl">
              <Zap className="mr-2 h-4 w-4" />
              MCP
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-indigo-600" />
                MCP Integration
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 p-4 dark:from-indigo-900/20 dark:to-purple-900/20">
                <h3 className="font-semibold text-indigo-800 dark:text-indigo-200">
                  🚀 Feature Coming Soon!
                </h3>
                <p className="mt-2 text-indigo-600 text-sm dark:text-indigo-300">
                  MCP (Model Context Protocol) integration will allow you to
                  create games directly through Claude Desktop and other
                  MCP-supporting platforms.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-foreground">What to expect:</h4>
                <ul className="space-y-2 text-muted-foreground text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 dark:text-indigo-400">
                      •
                    </span>
                    <span>Direct game creation via Claude Desktop</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 dark:text-indigo-400">
                      •
                    </span>
                    <span>Seamless integration with MCP platforms</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 dark:text-indigo-400">
                      •
                    </span>
                    <span>Enhanced AI-powered game development</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 dark:text-indigo-400">
                      •
                    </span>
                    <span>Cross-platform compatibility</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-lg bg-amber-50 p-3 dark:bg-amber-900/20">
                <p className="text-amber-800 text-sm dark:text-amber-200">
                  <strong>Stay tuned!</strong> This feature is currently in
                  development and will be available soon.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                className="w-full"
                onClick={() => setMcpDialogOpen(false)}
                variant="outline"
              >
                Got it!
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Publish Buttons */}
        {showPublishButtons && onPublishMarketplace && (
          <div className="flex items-center">
            {isPublishedToMarketplace ? (
              <div className="flex items-center gap-2">
                {onUnpublish && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg transition-all duration-200 hover:from-red-700 hover:to-rose-700 hover:shadow-xl">
                        <XCircle className="mr-2 h-4 w-4" />
                        Unpublish from Marketplace
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Unpublish from Marketplace</DialogTitle>
                      </DialogHeader>
                      <p>
                        Are you sure you want to unpublish this game from the
                        Marketplace? This will remove it from the public
                        marketplace listing.
                      </p>
                      <DialogFooter className="mt-4">
                        <Button
                          onClick={() => onUnpublish("marketplace")}
                          variant="ghost"
                        >
                          Yes, unpublish
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            ) : (
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg transition-all duration-200 hover:from-orange-700 hover:to-amber-700 hover:shadow-xl">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Publish to Marketplace
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Publish to Marketplace</DialogTitle>
                  </DialogHeader>
                  <p>
                    Are you sure you want to publish this game to the
                    Marketplace?
                  </p>
                  <DialogFooter className="mt-4">
                    <Button onClick={onPublishMarketplace} variant="ghost">
                      Yes, publish
                    </Button>
                    {onUnpublish && isPublishedToMarketplace && (
                      <Button
                        onClick={() => onUnpublish("marketplace")}
                        variant="ghost"
                      >
                        Unpublish
                      </Button>
                    )}
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
