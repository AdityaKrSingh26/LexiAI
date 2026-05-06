import React, { useState } from 'react';
import { Copy, Search, ChevronDown, ChevronUp, FileText, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';

const ChatMessage = ({ message, type, metadata, searchMetadata, isStreaming, sourcePdfs, isMultiDoc }) => {
  const isUser = type === 'user';
  const [showMetadata, setShowMetadata] = useState(false);
  const [copied, setCopied] = useState(false);

  const hasSearchInfo = searchMetadata || (metadata && (metadata.searchMethod || metadata.chunksUsed));

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}
    >
      {isUser ? (
        /* User bubble */
        <div className="group relative max-w-[75%]">
          <div className="bg-white/[0.06] border border-white/[0.07] rounded-2xl rounded-tr-sm px-4 py-3 text-white/90 text-sm leading-relaxed">
            {message}
          </div>
          <button
            onClick={copyToClipboard}
            className="absolute -bottom-2 right-2 p-1 bg-white/[0.04] border border-white/[0.06] rounded-md text-white/20 hover:text-white/60 opacity-0 group-hover:opacity-100 transition-all"
          >
            {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
          </button>
        </div>
      ) : (
        /* Bot message */
        <div className="group relative max-w-[85%] w-full">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center mt-0.5">
              <span className="text-[10px] font-semibold text-violet-400">L</span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-sm text-white/80 leading-relaxed prose prose-invert prose-sm max-w-none
                prose-p:my-1 prose-headings:text-white/90 prose-headings:font-semibold
                prose-code:text-violet-300 prose-code:bg-violet-500/10 prose-code:rounded prose-code:px-1 prose-code:text-xs
                prose-pre:bg-white/[0.04] prose-pre:border prose-pre:border-white/[0.07] prose-pre:rounded-xl
                prose-a:text-violet-400 prose-a:no-underline hover:prose-a:underline
                prose-blockquote:border-l-violet-500/40 prose-blockquote:text-white/50
                prose-li:my-0.5 prose-ul:my-1 prose-ol:my-1"
              >
                <ReactMarkdown>{message}</ReactMarkdown>
                {isStreaming && (
                  <span className="inline-block w-0.5 h-4 bg-violet-400 ml-0.5 animate-pulse align-middle rounded-full" />
                )}
              </div>

              {/* Multi-doc source pills */}
              {isMultiDoc && sourcePdfs?.length > 0 && !isStreaming && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {sourcePdfs.map(src => (
                    <span key={src.id} className="flex items-center gap-1 px-2 py-1 bg-indigo-500/10 text-indigo-400/80 text-xs rounded-full border border-indigo-500/20">
                      <FileText size={9} />
                      {src.title}
                    </span>
                  ))}
                </div>
              )}

              {/* Search metadata */}
              {hasSearchInfo && (
                <div className="mt-3 pt-3 border-t border-white/[0.05]">
                  <button
                    onClick={() => setShowMetadata(!showMetadata)}
                    className="flex items-center gap-1.5 text-xs text-white/25 hover:text-white/50 transition-colors"
                  >
                    <Search size={11} />
                    <span>Search Details</span>
                    {showMetadata ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                  </button>

                  <AnimatePresence>
                    {showMetadata && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2 p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-xs text-white/40 space-y-1.5 font-mono"
                      >
                        {(searchMetadata?.searchMethod || metadata?.searchMethod) && (
                          <div className="flex justify-between">
                            <span className="text-white/25">Method</span>
                            <span className="text-white/50">{searchMetadata?.searchMethod || metadata?.searchMethod}</span>
                          </div>
                        )}
                        {(searchMetadata?.selectedChunks || metadata?.chunksUsed) && (
                          <div className="flex justify-between">
                            <span className="text-white/25">Chunks</span>
                            <span className="text-white/50">
                              {searchMetadata?.selectedChunks || metadata?.chunksUsed}
                              {(searchMetadata?.totalChunks || metadata?.totalChunks) && ` / ${searchMetadata?.totalChunks || metadata?.totalChunks}`}
                            </span>
                          </div>
                        )}
                        {(searchMetadata?.contextLength || metadata?.contextLength) && (
                          <div className="flex justify-between">
                            <span className="text-white/25">Context</span>
                            <span className="text-white/50">{(searchMetadata?.contextLength || metadata?.contextLength).toLocaleString()} chars</span>
                          </div>
                        )}
                        {(searchMetadata?.averageRelevanceScore || metadata?.averageRelevanceScore) && (
                          <div className="flex justify-between">
                            <span className="text-white/25">Relevance</span>
                            <span className="text-white/50">{((searchMetadata?.averageRelevanceScore || metadata?.averageRelevanceScore) * 100).toFixed(1)}%</span>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            <button
              onClick={copyToClipboard}
              className="flex-shrink-0 self-start mt-0.5 p-1 text-white/15 hover:text-white/50 opacity-0 group-hover:opacity-100 transition-all"
            >
              {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ChatMessage;
