import React, { useState } from 'react';
import { generateShortsStrategy, generateThumbnailImage, ShortStrategy } from './services/geminiService';
import { Loader2, Youtube, Image as ImageIcon, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [strategies, setStrategies] = useState<ShortStrategy[]>([]);
  const [error, setError] = useState('');

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setError('');
    try {
      const results = await generateShortsStrategy(topic);
      setStrategies(results);
    } catch (err: any) {
      setError(err.message || 'Failed to generate strategies');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-indigo-500/30">
      <header className="border-b border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Youtube className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">Shorts Strategist</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold tracking-tight mb-4 bg-gradient-to-br from-white to-zinc-400 bg-clip-text text-transparent">
            Cinematic Shorts Strategy
          </h2>
          <p className="text-zinc-400 text-lg">
            Enter a topic and get 5 high-converting, SEO-optimized YouTube Shorts concepts with cinematic scripts and AI thumbnails.
          </p>
        </div>

        <form onSubmit={handleGenerate} className="max-w-2xl mx-auto mb-12">
          <div className="relative flex items-center">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Personal Finance for Beginners, Fitness at Home..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-6 pr-32 text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-zinc-600 shadow-xl shadow-black/20"
            />
            <button
              type="submit"
              disabled={loading || !topic.trim()}
              className="absolute right-2 bg-indigo-500 hover:bg-indigo-400 text-white px-6 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              Generate
            </button>
          </div>
          {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
        </form>

        <div className="space-y-6">
          {strategies.map((strategy, index) => (
            <StrategyCard key={strategy.id || index} strategy={strategy} topic={topic} index={index + 1} />
          ))}
        </div>
      </main>
    </div>
  );
}

const StrategyCard: React.FC<{ strategy: ShortStrategy; topic: string; index: number }> = ({ strategy, topic, index }) => {
  const [expanded, setExpanded] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [imageError, setImageError] = useState('');

  const handleGenerateThumbnail = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (generatingImage || thumbnailUrl) return;
    
    setGeneratingImage(true);
    setImageError('');
    try {
      const url = await generateThumbnailImage(strategy.thumbnail, topic);
      setThumbnailUrl(url);
    } catch (err: any) {
      setImageError(err.message || 'Failed to generate image');
    } finally {
      setGeneratingImage(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl overflow-hidden shadow-xl shadow-black/10"
    >
      <div 
        className="p-6 cursor-pointer flex items-start justify-between gap-4 hover:bg-zinc-800/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-zinc-800 text-zinc-300 text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
              Short #{index}
            </span>
            <h3 className="text-xl font-semibold text-zinc-100 line-clamp-1">{strategy.seo.title}</h3>
          </div>
          <p className="text-zinc-400 line-clamp-2">
            <span className="text-zinc-300 font-medium">Problem:</span> {strategy.problem}
          </p>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <button
            onClick={handleGenerateThumbnail}
            disabled={generatingImage}
            className="hidden sm:flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {generatingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
            {thumbnailUrl ? 'Regenerate Image' : 'Generate Image'}
          </button>
          <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
            {expanded ? <ChevronUp className="w-5 h-5 text-zinc-400" /> : <ChevronDown className="w-5 h-5 text-zinc-400" />}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-zinc-800/50"
          >
            <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                {/* Script Section */}
                <section>
                  <h4 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> Cinematic Script
                  </h4>
                  <div className="bg-zinc-950/50 rounded-xl p-5 space-y-4 border border-zinc-800/50">
                    <div>
                      <span className="text-indigo-400 font-bold text-sm uppercase tracking-wider">Hook (0-2s)</span>
                      <p className="text-zinc-200 mt-1 text-lg font-medium">"{strategy.hook}"</p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <span className="text-emerald-400 font-bold text-sm uppercase tracking-wider">Voiceover</span>
                        <p className="text-zinc-300 mt-1 text-sm leading-relaxed whitespace-pre-wrap">{strategy.script.voiceover}</p>
                      </div>
                      <div>
                        <span className="text-amber-400 font-bold text-sm uppercase tracking-wider">Visuals / Scenes</span>
                        <p className="text-zinc-400 mt-1 text-sm leading-relaxed whitespace-pre-wrap">{strategy.script.scenes}</p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* SEO Section */}
                <section>
                  <h4 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-4">SEO Metadata</h4>
                  <div className="space-y-4">
                    <div>
                      <span className="text-zinc-500 text-sm">Description</span>
                      <p className="text-zinc-300 text-sm mt-1">{strategy.seo.description}</p>
                    </div>
                    <div>
                      <span className="text-zinc-500 text-sm">Keywords</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {strategy.seo.keywords.map((kw, i) => (
                          <span key={i} className="bg-zinc-800/50 text-zinc-300 text-xs px-2.5 py-1 rounded-md border border-zinc-700/50">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-zinc-500 text-sm">Tags</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {strategy.seo.tags.map((tag, i) => (
                          <span key={i} className="text-indigo-400 text-xs">#{tag.replace(/^#/, '')}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              {/* Thumbnail Section */}
              <div className="space-y-6">
                <section>
                  <h4 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-4">Thumbnail Concept</h4>
                  <div className="bg-zinc-950/50 rounded-xl p-5 border border-zinc-800/50 space-y-3">
                    <div>
                      <span className="text-zinc-500 text-xs uppercase">Text Overlay</span>
                      <p className="text-white font-bold text-lg leading-tight mt-1">{strategy.thumbnail.text}</p>
                    </div>
                    <div>
                      <span className="text-zinc-500 text-xs uppercase">Visual Idea</span>
                      <p className="text-zinc-300 text-sm mt-1">{strategy.thumbnail.imageIdea}</p>
                    </div>
                    <div>
                      <span className="text-zinc-500 text-xs uppercase">Emotion</span>
                      <p className="text-zinc-300 text-sm mt-1">{strategy.thumbnail.emotion}</p>
                    </div>
                  </div>
                </section>

                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-bold text-zinc-500 uppercase tracking-wider">AI Generation</h4>
                    <button
                      onClick={handleGenerateThumbnail}
                      disabled={generatingImage}
                      className="sm:hidden flex items-center gap-1.5 text-indigo-400 text-xs font-bold uppercase tracking-wider disabled:opacity-50"
                    >
                      {generatingImage ? <Loader2 className="w-3 h-3 animate-spin" /> : <ImageIcon className="w-3 h-3" />}
                      Generate
                    </button>
                  </div>
                  
                  <div className="aspect-[9/16] bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden relative group">
                    {thumbnailUrl ? (
                      <>
                        <img src={thumbnailUrl} alt="Generated Thumbnail" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
                          <h2 className="text-white font-black text-3xl uppercase leading-none tracking-tight drop-shadow-2xl" style={{ textShadow: '0 4px 12px rgba(0,0,0,0.8)' }}>
                            {strategy.thumbnail.text}
                          </h2>
                        </div>
                      </>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                        {generatingImage ? (
                          <>
                            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
                            <p className="text-zinc-400 text-sm">Generating cinematic thumbnail...</p>
                          </>
                        ) : imageError ? (
                          <>
                            <p className="text-red-400 text-sm mb-3">{imageError}</p>
                            <button onClick={handleGenerateThumbnail} className="bg-zinc-800 text-white px-4 py-2 rounded-lg text-sm">Try Again</button>
                          </>
                        ) : (
                          <>
                            <ImageIcon className="w-12 h-12 text-zinc-800 mb-3" />
                            <p className="text-zinc-500 text-sm">Click generate to create an AI thumbnail based on this concept</p>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </section>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
