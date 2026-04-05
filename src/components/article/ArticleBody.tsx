/**
 * Simple markdown-like body renderer.
 * Splits on double newlines for paragraphs, converts **bold** to <strong>.
 */

interface ArticleBodyProps {
  body: string;
}

function renderParagraph(text: string): React.ReactNode[] {
  // Split by **...** for bold segments
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

export default function ArticleBody({ body }: ArticleBodyProps) {
  const paragraphs = body.split(/\n\n+/).filter((p) => p.trim().length > 0);

  return (
    <div>
      {paragraphs.map((paragraph, idx) => (
        <p
          key={idx}
          className="text-[17px] text-on-surface leading-[1.8] mb-6 last:mb-0"
        >
          {renderParagraph(paragraph)}
        </p>
      ))}
    </div>
  );
}
