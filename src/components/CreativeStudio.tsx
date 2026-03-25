import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Image as ImageIcon, Loader2, AlertCircle } from 'lucide-react';
import { KeyIcon } from './Icons';

const PROMPT_MAX_LENGTH = 500;
const isCreativeStudioLive = false;

export const CreativeStudio = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateImage = async () => {
    if (!isCreativeStudioLive) {
      setError('Creative Studio is not available on the public site yet.');
      return;
    }

    const trimmed = prompt.trim();
    if (!trimmed) return;
    if (trimmed.length > PROMPT_MAX_LENGTH) {
      setError(`Prompt must be ${PROMPT_MAX_LENGTH} characters or fewer.`);
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Server error (${res.status})`);
      }

      if (!data.image) {
        throw new Error('No image was returned. Please try a different prompt.');
      }

      setGeneratedImage(data.image);
    } catch (err: any) {
      console.error('Image generation error:', err);
      setError(err.message || 'Failed to generate image. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <section id="studio" className="py-28 bg-white relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-64 h-64 text-jurassic-dark/[0.03] pointer-events-none translate-x-1/3 -translate-y-1/3">
        <KeyIcon className="w-full h-full" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="bg-jurassic-dark rounded-3xl overflow-hidden shadow-premium flex flex-col lg:flex-row border border-white/5">
          <div className="lg:w-2/5 p-12 text-white flex flex-col justify-center bg-gradient-to-b from-jurassic-dark to-black/30">
            <div className="flex items-center gap-2 text-jurassic-accent mb-4">
              <Sparkles className="w-5 h-5 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-widest">Creative Studio</span>
            </div>
            <h2 className="text-4xl font-bold mb-6 tracking-tight">Excavate Your Imagination</h2>
            <p className="text-white/60 mb-8 font-light leading-relaxed">
              Visualize literary themes and moral dilemmas using our AI-powered Creative Studio. Generate evocative illustrations to anchor your reasoning.
            </p>

            <div className="space-y-4">
              {!isCreativeStudioLive ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm leading-relaxed text-white/70">
                  Creative Studio is being prepared for a later public release. Image generation is not available on the live site yet.
                </div>
              ) : null}
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                maxLength={PROMPT_MAX_LENGTH}
                aria-label="Creative Studio prompt"
                placeholder="Describe a literary scene... (e.g., 'A child standing at a crossroads of ancient stone paths')"
                disabled={!isCreativeStudioLive}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder:text-white/20 focus:outline-none focus:border-jurassic-accent min-h-[120px] transition-all font-light text-sm disabled:cursor-not-allowed disabled:opacity-50"
              />
              <div className="flex justify-between items-center">
                <span className="text-white/20 text-xs">{prompt.length}/{PROMPT_MAX_LENGTH}</span>
              </div>
              <button
                onClick={generateImage}
                disabled={!isCreativeStudioLive || isGenerating || !prompt.trim()}
                className="w-full bg-jurassic-accent text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all glow-hover"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Excavating...
                  </>
                ) : !isCreativeStudioLive ? (
                  <>
                    <AlertCircle className="w-5 h-5" />
                    Studio Coming Soon
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-5 h-5" />
                    Generate Illustration
                  </>
                )}
              </button>
              {error && (
                <div className="flex items-center gap-2 text-red-400 text-xs mt-2 bg-red-900/20 px-3 py-2 rounded-lg border border-red-900/30">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
            </div>
          </div>

          <div className="lg:w-3/5 bg-black/40 min-h-[450px] relative flex items-center justify-center p-8">
            <AnimatePresence mode="wait">
              {generatedImage ? (
                <motion.div
                  key="image"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full h-full rounded-2xl overflow-hidden shadow-premium border border-white/5"
                >
                  <img
                    src={generatedImage}
                    alt="Generated Illustration"
                    className="w-full h-full object-contain"
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-white/20"
                >
                  <div className="w-20 h-20 mx-auto mb-4 border border-white/5 rounded-full flex items-center justify-center bg-white/5">
                    <ImageIcon className="w-10 h-10 opacity-30" />
                  </div>
                  <p className="text-sm font-serif italic max-w-xs mx-auto">
                    {isCreativeStudioLive
                      ? 'Your excavated imagination will appear here.'
                      : 'Creative Studio visuals will appear here when the feature is released.'}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {isGenerating && (
              <div className="absolute inset-0 bg-transparent backdrop-blur-md flex items-center justify-center z-20">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 text-jurassic-accent animate-spin mx-auto mb-4 filter drop-shadow-[0_0_10px_rgba(242,100,25,0.4)]" />
                  <p className="text-white font-medium text-sm tracking-wide">Processing Neural Strata...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
