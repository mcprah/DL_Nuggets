import React from "react";

interface CodeBlockProps {
  className?: string;
  children?: React.ReactNode;
  node?: any;
}

export default function CodeBlock({ className, children }: CodeBlockProps) {
  const language = className?.replace(/language-/, "") || "text";
  
  return (
    <pre className="bg-gray-800 text-white p-3 rounded-md overflow-x-auto my-4">
      <code className={`language-${language}`}>{children}</code>
    </pre>
  );
}