"use client";

type PreviewProps = {
  srcDoc: string;
};

export function Preview({ srcDoc }: PreviewProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex-grow bg-white">
        <iframe
          className="border-0"
          height="100%"
          sandbox="allow-scripts"
          srcDoc={srcDoc}
          title="Live Preview"
          width="100%"
        />
      </div>
    </div>
  );
}
