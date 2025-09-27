"use client";

import { Copy, Share2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { QRCode } from "@/components/ui/kibo-ui/qr-code";
import { cn } from "@/lib/utils";

// NOTE: This file expects the `@kibo/qr-code` shadcn component to be added to the project.
// Add it with: pnpm dlx shadcn@latest add @kibo/qr-code
// The component name used below is `QrCode` from that package.

type QrShareProps = {
  url: string;
  className?: string;
};

export function QrShare({ url, className }: QrShareProps) {
  const [copied, setCopied] = useState(false);

  const COPY_FEEDBACK_MS = 1600;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), COPY_FEEDBACK_MS);
    } catch (_err) {
      // copy failed; not actionable in this UI
    }
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Dialog>
        <DialogTrigger asChild>
          <Button className="w-full" variant="outline">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-sm">
          <DialogTitle className="font-medium text-lg">Share link</DialogTitle>
          <div className="grid gap-4">
            <div className="flex justify-center">
              <QRCode className="h-56 w-56" data={url} />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <input
                  className="flex-1 rounded-md border px-3 py-2 text-sm"
                  readOnly
                  value={url}
                />
                <Button onClick={copy} size="sm" variant="default">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex justify-end">
                <Button onClick={copy} size="sm" variant="ghost">
                  {copied ? "Copied" : "Copy link"}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default QrShare;
