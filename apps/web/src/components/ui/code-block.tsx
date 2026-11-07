'use client';

import * as React from 'react';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CodeBlockProps {
  snippets: Record<string, string>;
  className?: string;
}

export function CodeBlock({ snippets, className }: CodeBlockProps) {
  const tabs = Object.keys(snippets);
  const [activeTab, setActiveTab] = React.useState(tabs[0] || 'curl');
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    const text = snippets[activeTab] || '';
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        'rounded-lg border border-[#2C3936] bg-[#0D1515] overflow-hidden',
        className
      )}
    >
      <div className="flex items-center justify-between border-b border-[#2C3936] px-3 py-1.5 bg-[#142522]">
        <div className="flex items-center space-x-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-2.5 py-1 text-xs font-mono uppercase rounded transition-colors',
                activeTab === tab
                  ? 'bg-[#1C2928] text-[#C8F169] font-bold border border-[#2C3936]'
                  : 'text-[#A0ADA7] hover:text-white'
              )}
            >
              {tab}
            </button>
          ))}
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-[#A0ADA7] hover:text-[#C8F169] transition-colors px-2 py-1 rounded"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-[#19875D]" />
              <span className="text-[#19875D]">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="p-4 overflow-x-auto text-xs font-mono text-[#EAF0EC] leading-relaxed select-all">
        <pre>{snippets[activeTab]}</pre>
      </div>
    </div>
  );
}
