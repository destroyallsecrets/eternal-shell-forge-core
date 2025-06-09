
import ReactMarkdown from 'react-markdown';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer = ({ content }: MarkdownRendererProps) => {
  return (
    <div className="prose prose-invert prose-green max-w-none">
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold text-green-400 mb-4 mt-4">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-semibold text-green-400 mb-3 mt-4">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-semibold text-green-400 mb-2 mt-4">{children}</h3>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-green-300">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-green-300">{children}</em>
          ),
          code: ({ children, className }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="bg-gray-800 border border-green-400/20 rounded px-2 py-1 text-green-300 text-sm">
                  {children}
                </code>
              );
            }
            return (
              <code className="text-green-300 text-sm">
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="bg-gray-800 border border-green-400/20 rounded p-3 my-3 overflow-x-auto">
              {children}
            </pre>
          ),
          p: ({ children }) => (
            <p className="mb-2">{children}</p>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
