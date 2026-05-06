import { useEffect, useRef, useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { SendIcon, LoaderIcon, FileText, Files } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
  chatMode?: "single" | "multi";
  selectedPdfIds?: string[];
  currentPdf?: { title: string } | null;
  onChangeChatMode?: (mode: "single" | "multi") => void;
  extraContent?: React.ReactNode;
  placeholder?: string;
}

function TypingDots() {
  return (
    <div className="flex items-center ml-1">
      {[1, 2, 3].map((dot) => (
        <motion.div
          key={dot}
          className="w-1.5 h-1.5 bg-white/90 rounded-full mx-0.5"
          initial={{ opacity: 0.3 }}
          animate={{ opacity: [0.3, 0.9, 0.3], scale: [0.85, 1.1, 0.85] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: dot * 0.15, ease: "easeInOut" }}
          style={{ boxShadow: "0 0 4px rgba(255,255,255,0.3)" }}
        />
      ))}
    </div>
  );
}

export function ChatInput({
  onSend,
  isLoading = false,
  disabled = false,
  chatMode = "single",
  selectedPdfIds = [],
  currentPdf = null,
  onChangeChatMode,
  extraContent,
  placeholder,
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const [inputFocused, setInputFocused] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback((reset?: boolean) => {
    const el = textareaRef.current;
    if (!el) return;
    if (reset) { el.style.height = "52px"; return; }
    el.style.height = "52px";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => setMousePosition({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || isLoading || disabled) return;
    onSend(trimmed);
    setValue("");
    adjustHeight(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const resolvedPlaceholder = placeholder ?? (
    chatMode === "multi"
      ? selectedPdfIds.length === 0
        ? "Select documents above to start chatting..."
        : `Ask across ${selectedPdfIds.length} document${selectedPdfIds.length !== 1 ? "s" : ""}...`
      : currentPdf
      ? "Ask a question about your PDF..."
      : "Upload a PDF to start chatting"
  );

  const canSend = value.trim().length > 0 && !isLoading && !disabled;

  return (
    <div className="relative w-full">
      {/* Glow orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
        <div className="absolute top-0 left-1/4 w-48 h-48 bg-violet-500/5 rounded-full blur-[64px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-indigo-500/5 rounded-full blur-[64px] animate-pulse" style={{ animationDelay: "700ms" }} />
      </div>

      {/* Mode toggle */}
      {onChangeChatMode && (
        <div className="flex items-center gap-2 mb-2 px-1">
          <button
            onClick={() => onChangeChatMode("single")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-all",
              chatMode === "single"
                ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                : "text-white/30 hover:text-white/60 border border-white/[0.05]"
            )}
          >
            <FileText size={12} />
            Single Doc
          </button>
          <button
            onClick={() => onChangeChatMode("multi")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-all",
              chatMode === "multi"
                ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                : "text-white/30 hover:text-white/60 border border-white/[0.05]"
            )}
          >
            <Files size={12} />
            Multi-Doc
            {chatMode === "multi" && selectedPdfIds.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-indigo-500/40 rounded-full text-[10px]">
                {selectedPdfIds.length}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Extra content slot (MultiDocSelector) */}
      {extraContent && <div className="mb-2">{extraContent}</div>}

      {/* Main input box */}
      <motion.div
        className="relative backdrop-blur-2xl bg-white/[0.02] rounded-2xl border border-white/[0.05] shadow-2xl"
        initial={{ scale: 0.99 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        {/* Focus ring */}
        <AnimatePresence>
          {inputFocused && (
            <motion.span
              className="absolute inset-0 rounded-2xl pointer-events-none ring-1 ring-violet-500/20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </AnimatePresence>

        <div className="p-4">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => { setValue(e.target.value); adjustHeight(); }}
            onKeyDown={handleKeyDown}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            placeholder={resolvedPlaceholder}
            disabled={disabled}
            className={cn(
              "w-full resize-none bg-transparent border-none outline-none",
              "text-white/90 text-sm placeholder:text-white/20",
              "min-h-[52px] max-h-[160px]",
              "disabled:opacity-40 disabled:cursor-not-allowed"
            )}
            style={{ overflow: "hidden" }}
            rows={1}
          />
        </div>

        <div className="px-4 pb-4 flex items-center justify-between gap-4">
          <div className="text-xs text-white/20 select-none">
            {currentPdf && chatMode === "single" ? (
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/60 inline-block" />
                {currentPdf.title.length > 30 ? currentPdf.title.slice(0, 30) + "…" : currentPdf.title}
              </span>
            ) : null}
          </div>

          <motion.button
            type="button"
            onClick={handleSend}
            whileHover={canSend ? { scale: 1.02 } : {}}
            whileTap={canSend ? { scale: 0.97 } : {}}
            disabled={!canSend}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2",
              canSend
                ? "bg-white text-[#0A0A0B] shadow-lg shadow-white/10"
                : "bg-white/[0.05] text-white/30 cursor-not-allowed"
            )}
          >
            {isLoading ? (
              <LoaderIcon className="w-4 h-4 animate-spin" />
            ) : (
              <SendIcon className="w-4 h-4" />
            )}
            <span>Send</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Thinking indicator */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            className="absolute -top-14 left-1/2 -translate-x-1/2 backdrop-blur-2xl bg-white/[0.03] rounded-full px-4 py-2 border border-white/[0.05] shadow-lg whitespace-nowrap"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
          >
            <div className="flex items-center gap-2 text-sm text-white/60">
              <span>LexiAI thinking</span>
              <TypingDots />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mouse-follow glow when focused */}
      {inputFocused && (
        <motion.div
          className="fixed w-[30rem] h-[30rem] rounded-full pointer-events-none z-0 opacity-[0.03] bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500 blur-[80px]"
          animate={{ x: mousePosition.x - 240, y: mousePosition.y - 240 }}
          transition={{ type: "spring", damping: 25, stiffness: 150, mass: 0.5 }}
        />
      )}
    </div>
  );
}
