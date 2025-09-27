import { AlertTriangle, Coins, Save } from "lucide-react";
import type React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type OwnershipFeeDialogProps = {
  onSave: () => void;
  isSaving: boolean;
  children: React.ReactNode;
};

export function OwnershipFeeDialog({
  onSave,
  isSaving,
  children,
}: OwnershipFeeDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Ownership Registration Required
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/20">
            <Coins className="mt-0.5 h-5 w-5 text-amber-600 dark:text-amber-400" />
            <div className="space-y-2">
              <p className="font-medium text-amber-800 text-sm dark:text-amber-200">
                Ownership Fee: 1 GEM
              </p>
              <p className="text-amber-700 text-sm dark:text-amber-300">
                To save your game and establish ownership on the blockchain, you
                need to pay a 1 GEM fee. This ensures your ownership rights and
                allows you to sell your game in the future.
              </p>
            </div>
          </div>
          <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900">
            <p className="text-slate-600 text-xs dark:text-slate-400">
              <strong>Contract ID:</strong>{" "}
              {process.env.NEXT_PUBLIC_PUBLISH_REGISTRY_APP_ID ||
                "Not configured"}
            </p>
          </div>
          <p className="text-slate-600 text-sm dark:text-slate-400">
            By proceeding, you agree to pay the ownership fee and register your
            game on the GEMrand blockchain.
          </p>
        </div>
        <DialogFooter className="mt-4">
          <Button
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700"
            disabled={isSaving}
            onClick={onSave}
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Processing..." : "Pay 1 GEM & Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
