"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Bot, Loader2, Sparkles } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import type { GenerateGameCodeOutput } from "@/ai/flows/generate-game-code-ai-sdk";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { generateGame, refinePromptAction } from "@/lib/actions-ai-sdk";

const formSchema = z.object({
  prompt: z.string().min(10, {
    message: "Prompt must be at least 10 characters.",
  }),
});

type GameGeneratorDialogProps = {
  onGenerate: (output: GenerateGameCodeOutput) => void;
  children: React.ReactNode;
  html: string;
  isGameGenerated: boolean;
};

export function GameGeneratorDialog({
  onGenerate,
  children,
  html,
  isGameGenerated,
}: GameGeneratorDialogProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [isRefining, setIsRefining] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  const handleRefinePrompt = async () => {
    const currentPrompt = form.getValues("prompt");
    if (currentPrompt.length < 10) {
      form.setError("prompt", {
        type: "manual",
        message:
          "Please enter a game idea of at least 10 characters to refine.",
      });
      return;
    }

    setIsRefining(true);
    try {
      const result = await refinePromptAction({
        prompt: currentPrompt,
        isGameGenerated,
      });
      form.setValue("prompt", result.refinedPrompt, { shouldValidate: true });
      toast.success("Prompt Refined!", {
        description: "Your game idea has been enhanced with more detail.",
      });
    } catch {
      toast.error("Refinement Failed", {
        description:
          "There was an error refining the prompt. Please try again.",
      });
    } finally {
      setIsRefining(false);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsGenerating(true);
    try {
      const result = await generateGame({
        prompt: values.prompt,
        previousHtml: isGameGenerated ? html : undefined,
      });
      onGenerate(result);
      setIsOpen(false);
      form.reset();
    } catch {
      toast.error("Generation Failed", {
        description:
          "There was an error generating the game. Please try again.",
      });
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <Dialog onOpenChange={setIsOpen} open={isOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 sm:max-w-[500px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <div className="mb-2 flex items-center gap-3">
                <div className="rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 p-2">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <DialogTitle className="font-bold text-white text-xl">
                  {isGameGenerated ? "Refine Your Game" : "AI Game Generator"}
                </DialogTitle>
              </div>
              <DialogDescription className="text-slate-300">
                {isGameGenerated
                  ? "Describe the changes or new features you want to add to your game."
                  : "Describe the game you want to create, and let AI build the code for you. Be as detailed as possible for better results!"}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <FormField
                control={form.control}
                name="prompt"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel className="font-medium text-white">
                        {isGameGenerated
                          ? "Feedback or Refinements"
                          : "Game Idea"}
                      </FormLabel>
                      <Button
                        className="h-auto rounded p-0 px-2 py-1 text-blue-400 transition-all hover:bg-blue-500/10 hover:text-blue-300"
                        disabled={isRefining || isGenerating}
                        onClick={handleRefinePrompt}
                        size="sm"
                        type="button"
                        variant="ghost"
                      >
                        {isRefining ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Refining...
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Refine
                          </>
                        )}
                      </Button>
                    </div>
                    <FormControl>
                      <Textarea
                        className="min-h-[120px] resize-none border-slate-600 bg-slate-700/50 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                        placeholder={
                          isGameGenerated
                            ? "e.g., Make the paddle smaller and the ball faster, add power-ups, or change the background color."
                            : "e.g., A simple breakout-style game with a paddle and a ball. Include scoring, multiple levels, and colorful graphics."
                        }
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="gap-3">
              <Button
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg transition-all duration-200 hover:from-purple-700 hover:to-blue-700 hover:shadow-xl"
                disabled={isGenerating || isRefining}
                type="submit"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isGameGenerated
                      ? "Refining Game..."
                      : "Generating Game..."}
                  </>
                ) : (
                  <>
                    <Bot className="mr-2 h-4 w-4" />
                    {isGameGenerated ? "Refine Code" : "Generate Code"}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
