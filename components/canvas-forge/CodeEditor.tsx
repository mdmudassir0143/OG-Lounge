"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full" />,
});

type CodeEditorProps = {
  language: string;
  value: string;
  onChange: (value: string | undefined) => void;
};

export function CodeEditor({ language, value, onChange }: CodeEditorProps) {
  const lang = language.toLowerCase();

  return (
    <div className="flex h-full flex-col bg-[#1e1e1e]">
      <div className="flex-grow">
        <MonacoEditor
          height="100%"
          language={lang}
          onChange={onChange}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            wordWrap: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
          theme="vs-dark"
          value={value}
        />
      </div>
    </div>
  );
}
