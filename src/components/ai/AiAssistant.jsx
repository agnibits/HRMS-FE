import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LuSparkles, LuX, LuSendHorizontal, LuBriefcaseBusiness, LuFileText,
  LuUserRoundSearch, LuCalendarDays, LuRotateCcw, LuTriangleAlert,
} from 'react-icons/lu';
import { aiService } from '@/services/aiService';
import { useAuth } from '@/hooks/useAuth';
import { setAiOpen, selectAiOpen } from '@/store/uiSlice';
import { titleCase } from '@/utils/formatters';
import cn from '@/utils/cn';
import { IconButton } from '@/components/common/Button';
import Spinner from '@/components/common/Spinner';

const QUICK_PROMPTS = [
  { icon: LuBriefcaseBusiness, label: 'Write a job description', prompt: 'Write a professional job description for a Senior Software Engineer (remote, full-time). Include responsibilities, requirements and a short about-the-role intro.' },
  { icon: LuUserRoundSearch, label: 'Screen a resume', prompt: 'I want to screen a candidate resume against a role. Ask me to paste the job title and the resume text, then give a match score out of 10 with strengths and gaps.' },
  { icon: LuFileText, label: 'Summarize a document', prompt: 'I will paste an HR document or policy. Summarize it in 5 concise bullet points and flag any important dates or obligations.' },
  { icon: LuCalendarDays, label: 'Leave & holiday policy', prompt: 'Explain how annual leave accrual and public holidays typically work in an HR policy, in simple terms.' },
];

function Bubble({ role, content }) {
  const isUser = role === 'user';
  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
          isUser
            ? 'rounded-br-md bg-primary-600 text-white'
            : 'rounded-bl-md bg-surface-100 text-surface-800 dark:bg-surface-800 dark:text-surface-100'
        )}
      >
        {content}
      </div>
    </div>
  );
}

export function AiAssistant() {
  const isOpen = useSelector(selectAiOpen);
  const dispatch = useDispatch();
  const location = useLocation();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  const close = () => dispatch(setAiOpen(false));
  const reset = () => { setMessages([]); setError(null); };

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 200);
  }, [isOpen]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, pending]);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && isOpen && close();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }); // eslint-disable-line react-hooks/exhaustive-deps

  const send = async (text) => {
    const content = (text ?? input).trim();
    if (!content || pending) return;
    setError(null);
    const next = [...messages, { role: 'user', content }];
    setMessages(next);
    setInput('');
    setPending(true);
    try {
      const context = `Page: ${titleCase(location.pathname.split('/').filter(Boolean).slice(-1)[0] || 'dashboard')}`;
      const { data } = await aiService.chat(
        next.map((m) => ({ role: m.role, content: m.content })),
        context
      );
      const reply = data?.reply || data?.message || 'Sorry, I could not generate a response.';
      setMessages((m) => [...m, { role: 'assistant', content: reply }]);
    } catch (err) {
      setError(
        err?.status === 404
          ? 'The AI service isn’t enabled on the server yet. Ask your admin to deploy the /ai endpoints.'
          : err?.message || 'Something went wrong. Please try again.'
      );
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      {/* Floating trigger (bottom-right) */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', bounce: 0.4, duration: 0.5 }}
            onClick={() => dispatch(setAiOpen(true))}
            className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 px-4 py-3 text-sm font-semibold text-white shadow-pop transition-transform hover:scale-105"
            aria-label="Open AI assistant"
          >
            <LuSparkles className="size-5" />
            <span className="hidden sm:inline">Ask AI</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Drawer */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50">
            <motion.div
              className="absolute inset-0 bg-surface-950/50 backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={close}
            />
            <motion.aside
              className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-pop dark:bg-surface-900"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', duration: 0.4, bounce: 0 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-surface-200 px-5 py-4 dark:border-surface-800">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-sm">
                    <LuSparkles className="size-5" />
                  </span>
                  <div>
                    <h2 className="text-sm font-semibold text-surface-900 dark:text-surface-100">HR Assistant</h2>
                    <p className="text-xs text-surface-400">Powered by Groq</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {messages.length > 0 && (
                    <IconButton icon={LuRotateCcw} label="New chat" size="sm" onClick={reset} />
                  )}
                  <IconButton icon={LuX} label="Close" size="sm" onClick={close} />
                </div>
              </div>

              {/* Messages */}
              <div ref={scrollRef} className="grow space-y-4 overflow-y-auto px-5 py-5">
                {messages.length === 0 ? (
                  <div className="flex h-full flex-col">
                    <div className="mb-5">
                      <p className="text-sm font-medium text-surface-800 dark:text-surface-200">
                        Hi {user?.firstName || 'there'} 👋
                      </p>
                      <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
                        I can answer HR questions, draft job descriptions, screen resumes and summarize documents. Try a starter:
                      </p>
                    </div>
                    <div className="space-y-2">
                      {QUICK_PROMPTS.map((q) => (
                        <button
                          key={q.label}
                          onClick={() => send(q.prompt)}
                          className="flex w-full items-center gap-3 rounded-xl border border-surface-200 px-3.5 py-3 text-left text-sm text-surface-700 transition-colors hover:border-primary-300 hover:bg-primary-50/50 dark:border-surface-700 dark:text-surface-200 dark:hover:border-primary-700 dark:hover:bg-primary-950/30"
                        >
                          <q.icon className="size-4.5 shrink-0 text-primary-600 dark:text-primary-400" />
                          {q.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  messages.map((m, i) => <Bubble key={i} {...m} />)
                )}

                {pending && (
                  <div className="flex items-center gap-2 text-sm text-surface-400">
                    <Spinner size="sm" /> Thinking…
                  </div>
                )}

                {error && (
                  <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-3 text-sm text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
                    <LuTriangleAlert className="mt-0.5 size-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
              </div>

              {/* Composer */}
              <div className="border-t border-surface-200 p-3 dark:border-surface-800">
                <form
                  onSubmit={(e) => { e.preventDefault(); send(); }}
                  className="flex items-end gap-2 rounded-2xl border border-surface-300 bg-white p-1.5 pl-3 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20 dark:border-surface-700 dark:bg-surface-850"
                >
                  <textarea
                    ref={inputRef}
                    rows={1}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
                    }}
                    placeholder="Ask anything about HR…"
                    className="max-h-32 grow resize-none bg-transparent py-1.5 text-sm text-surface-900 placeholder-surface-400 focus:outline-none dark:text-surface-100"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || pending}
                    className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary-600 text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Send"
                  >
                    <LuSendHorizontal className="size-4.5" />
                  </button>
                </form>
                <p className="mt-2 text-center text-[11px] text-surface-400">
                  AI can make mistakes. Verify important HR decisions.
                </p>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export default AiAssistant;
