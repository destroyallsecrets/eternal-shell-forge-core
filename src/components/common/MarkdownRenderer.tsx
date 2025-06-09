
import { useMemo } from 'react';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer = ({ content }: MarkdownRendererProps) => {
  const processedContent = useMemo(() => {
    // Simple markdown processor for basic formatting
    let processed = content;
    
    // Headers
    processed = processed.replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold text-green-400 mb-2 mt-4">$1</h3>');
    processed = processed.replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold text-green-400 mb-3 mt-4">$1</h2>');
    processed = processed.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-green-400 mb-4 mt-4">$1</h1>');
    
    // Bold and italic
    processed = processed.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-green-300">$1</strong>');
    processed = processed.replace(/\*(.*?)\*/g, '<em class="italic text-green-300">$1</em>');
    
    // Code blocks
    processed = processed.replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-800 border border-green-400/20 rounded p-3 my-3 overflow-x-auto"><code class="text-green-300 text-sm">$1</code></pre>');
    processed = processed.replace(/`(.*?)`/g, '<code class="bg-gray-800 border border-green-400/20 rounded px-2 py-1 text-green-300 text-sm">$1</code>');
    
    // Line breaks
    processed = processed.replace(/\n\n/g, '</p><p class="mb-2">');
    processed = processed.replace(/\n/g, '<br>');
    
    // Wrap in paragraph if not already wrapped
    if (!processed.startsWith('<')) {
      processed = `<p class="mb-2">${processed}</p>`;
    }
    
    return processed;
  }, [content]);

  return (
    <div 
      className="prose prose-invert prose-green max-w-none"
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  );
};
