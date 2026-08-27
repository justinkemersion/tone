import ReactMarkdown from "react-markdown";

export function MarkdownBody({ content }: { content: string }) {
  return (
    <div className="prose prose-sm max-w-none text-[var(--foreground)] [&_a]:text-[var(--accent)]">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
