import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, GitBranch, MessageSquare, Upload, Sparkles, FileText, ArrowRight, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const features = [
  { icon: Brain, title: 'AI-Powered Analysis', description: 'Ask questions about your documents and get intelligent, context-aware responses powered by advanced AI.' },
  { icon: MessageSquare, title: 'Interactive Chat', description: 'Engage in natural conversations about your documents with our AI assistant in real time.' },
  { icon: GitBranch, title: 'Visual Flowcharts', description: 'Automatically generate visual flowcharts to better understand document structure and flow.' },
  { icon: Upload, title: 'Easy Upload', description: 'Drag and drop your PDFs or click to upload. We handle the processing instantly.' },
  { icon: Sparkles, title: 'Smart Summaries', description: 'Get instant AI-generated summaries of your documents, saving you hours of reading time.' },
  { icon: FileText, title: 'Chat History', description: 'Access your previous conversations and analyses, organized by document for easy reference.' },
];

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export default function HomePage() {
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated()) navigate('/dashboard');
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#09090B] text-zinc-100 overflow-x-hidden">
      {/* Radial glow background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[900px] h-[600px] rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute left-1/4 bottom-1/4 w-[400px] h-[400px] rounded-full bg-violet-800/8 blur-[100px]" />
      </div>

      {/* Grid overlay */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(#a78bfa 1px, transparent 1px), linear-gradient(90deg, #a78bfa 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-10 py-5 border-b border-zinc-800/60 backdrop-blur-sm bg-zinc-950/80">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-violet-600/20 border border-violet-500/30">
            <Sparkles size={14} className="text-violet-400" />
          </div>
          <span className="font-semibold text-sm tracking-wide text-zinc-100">LexiAI</span>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/login')}
            className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60"
          >
            Sign in
          </Button>
          <Button
            size="sm"
            onClick={() => navigate('/login')}
            className="bg-violet-600 hover:bg-violet-500 text-white border-0 shadow-lg shadow-violet-900/30"
          >
            Get started
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-28 pb-24 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="flex flex-col items-center gap-6"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs font-medium tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            AI-Powered PDF Analysis
            <ChevronRight size={12} className="opacity-60" />
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.08]">
            <span className="text-zinc-100">Chat with your PDFs,</span>
            <br />
            <span
              className="bg-gradient-to-r from-violet-400 via-violet-300 to-indigo-400 bg-clip-text text-transparent"
            >
              intelligently.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-zinc-400 text-lg md:text-xl max-w-2xl leading-relaxed">
            Transform any PDF into an interactive conversation. Extract insights, generate summaries,
            and visualize content structure — all powered by advanced AI.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
            <Button
              size="lg"
              onClick={() => navigate('/login')}
              className="bg-violet-600 hover:bg-violet-500 text-white shadow-xl shadow-violet-900/40 px-6 gap-2"
            >
              Get started free
              <ArrowRight size={16} />
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800/60 hover:text-zinc-100 hover:border-zinc-600 px-6"
            >
              <a href="#features">See features</a>
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center gap-6 mt-2">
            {['No credit card required', 'Free tier available', 'Process PDFs instantly'].map((item) => (
              <span key={item} className="flex items-center gap-1.5 text-xs text-zinc-500">
                <span className="text-violet-400">✓</span>
                {item}
              </span>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 max-w-6xl mx-auto px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <p className="text-violet-400 text-xs font-medium tracking-[0.2em] uppercase mb-3">Capabilities</p>
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-100 tracking-tight">Everything you need</h2>
          <p className="mt-3 text-zinc-400 text-base max-w-xl mx-auto">
            A complete toolkit for turning static documents into dynamic knowledge.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {features.map((f) => (
            <motion.div key={f.title} variants={fadeUp}>
              <Card className="group relative bg-zinc-900/50 border-zinc-800/60 hover:border-violet-500/40 hover:bg-zinc-900/80 transition-all duration-300 overflow-hidden">
                {/* Corner accent on hover */}
                <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-violet-600/5 to-transparent" />
                </div>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="flex items-center justify-center w-9 h-9 rounded-lg border border-zinc-700/60 bg-zinc-800/60 group-hover:border-violet-500/40 group-hover:bg-violet-500/10 transition-all duration-300">
                      <f.icon size={16} className="text-zinc-400 group-hover:text-violet-400 transition-colors duration-300" />
                    </div>
                  </div>
                  <CardTitle className="text-base font-semibold text-zinc-100">{f.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-zinc-500 leading-relaxed">{f.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 border-t border-zinc-800/60">
        <div className="max-w-3xl mx-auto px-6 py-24 text-center">
          {/* Glow behind CTA */}
          <div className="absolute left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-violet-600/10 blur-[80px] rounded-full pointer-events-none" />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <p className="text-violet-400 text-xs font-medium tracking-[0.2em] uppercase mb-4">Get started</p>
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-100 mb-3 tracking-tight">Ready to begin?</h2>
            <p className="text-zinc-400 text-base mb-8 max-w-md mx-auto">
              Join users experiencing AI-driven PDF analysis. Start for free, no card needed.
            </p>
            <Button
              size="lg"
              onClick={() => navigate('/login')}
              className="bg-violet-600 hover:bg-violet-500 text-white shadow-xl shadow-violet-900/40 px-8 gap-2"
            >
              Get started now
              <ArrowRight size={16} />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-zinc-800/60 px-6 md:px-10 py-6">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-6 h-6 rounded-md bg-violet-600/20 border border-violet-500/30">
              <Sparkles size={11} className="text-violet-400" />
            </div>
            <span className="text-sm font-semibold text-zinc-400">LexiAI</span>
          </div>
          <p className="text-xs text-zinc-600">© 2024 LexiAI. All rights reserved.</p>
          <a
            href="https://github.com/AdityaKrSingh26"
            className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
          >
            Contact
          </a>
        </div>
      </footer>
    </div>
  );
}
