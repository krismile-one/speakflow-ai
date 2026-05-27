/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mic, Upload, ArrowLeft, Headphones, Loader2, Sparkles, Languages, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AudioUploader } from './components/AudioUploader';
import { AudioRecorder } from './components/AudioRecorder';
import { SentenceCard } from './components/SentenceCard';
import { analyzeOralAudio, OralAnalysisResult, WordInfo } from './services/geminiService';
import { playTTS } from './lib/tts';

export default function App() {
  const [step, setStep] = useState<'upload' | 'processing' | 'result'>('upload');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<OralAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const [selectedWord, setSelectedWord] = useState<WordInfo | null>(null);
  const [activeSegmentIndex, setActiveSegmentIndex] = useState<number | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stopAudioPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setActiveSegmentIndex(null);
  };

  useEffect(() => {
    if (step === 'processing') {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) return prev;
          return prev + Math.random() * 5;
        });
      }, 500);
      return () => clearInterval(interval);
    }
  }, [step]);

  const handleAudioSelected = async (file: File | Blob) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];
      const mimeType = file.type || 'audio/webm';
      
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
      setStep('processing');
      setError(null);
      setProgress(10);
      setSelectedWord(null);

      try {
        const result = await analyzeOralAudio(base64, mimeType);
        setAnalysis(result);
        if (result.sentences.length > 0 && result.sentences[0].words.length > 0) {
          setSelectedWord(result.sentences[0].words[0]);
        }
        setStep('result');
      } catch (err) {
        console.error(err);
        setError('分析失败，请稍后重试。');
        setStep('upload');
      }
    };
    reader.readAsDataURL(file);
  };

  const playSegment = (index: number, start: number, end: number) => {
    if (!audioRef.current) return;

    // Toggle logic: if clicking the same segment that's already playing, stop it.
    if (activeSegmentIndex === index && !audioRef.current.paused) {
      stopAudioPlayback();
      return;
    }

    // Stop TTS when playing user audio
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    // Add a small buffer to prevent truncation at the beginning or end
    const paddedStart = Math.max(0, start - 0.2);
    const paddedEnd = end + 0.2;

    audioRef.current.currentTime = paddedStart;
    audioRef.current.play();
    setActiveSegmentIndex(index);
    
    const stopAt = () => {
      if (audioRef.current && audioRef.current.currentTime >= paddedEnd) {
        audioRef.current.pause();
        setActiveSegmentIndex(null);
        audioRef.current.removeEventListener('timeupdate', stopAt);
      }
    };
    audioRef.current.addEventListener('timeupdate', stopAt);

    // Also stop if the audio ends naturally
    const handleEnd = () => {
      setActiveSegmentIndex(null);
      audioRef.current?.removeEventListener('ended', handleEnd);
    };
    audioRef.current.addEventListener('ended', handleEnd);
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-slate-900 selection:bg-primary/20">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] bg-blue-100/30 blur-[100px] rounded-full" />
      </div>

      <header className="relative z-10 border-b border-slate-200/60 bg-white/70 backdrop-blur-md sticky top-0">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setStep('upload')}>
            <div className="h-8 w-8 bg-black rounded-lg flex items-center justify-center">
              <Languages className="h-5 w-5 text-white" />
            </div>
            <h1 className="editorial-serif italic text-2xl font-bold tracking-tight">SpeakFlow AI</h1>
          </div>
          {step === 'result' && (
            <Button variant="ghost" size="sm" onClick={() => setStep('upload')} className="label-caps gap-2 text-primary">
              <ArrowLeft className="h-4 w-4" /> 重新开始
            </Button>
          )}
        </div>
      </header>

      <main className={`relative z-10 mx-auto transition-all duration-500 ${step === 'result' ? 'max-w-none w-full px-0' : 'max-w-4xl px-6 py-12'}`}>
        <AnimatePresence mode="wait">
          {step === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              <div className="text-center space-y-4 max-w-2xl mx-auto">
                <Badge variant="secondary" className="label-caps bg-primary text-white border-none py-1.5 px-4 mb-4">
                  AI 驱动的口语反馈
                </Badge>
                <h2 className="text-5xl md:text-6xl editorial-serif font-bold tracking-tight text-foreground leading-[0.95]">
                  听见你的进步，<br />
                  <span className="text-primary italic">逐句纠正，单词发音。</span>
                </h2>
                <p className="text-xl text-muted-foreground font-light leading-relaxed">
                  上传你的英语录音，AI 将为你切分句子，并提供每一个单词的音标与释义，助力纯正口语。
                </p>
              </div>

              <Card className="border-none shadow-2xl shadow-slate-200/50 bg-white overflow-hidden">
                <CardContent className="p-0">
                  <Tabs defaultValue="upload" className="w-full">
                    <TabsList className="w-full grid grid-cols-2 h-14 bg-slate-50 rounded-none p-0">
                      <TabsTrigger value="upload" className="rounded-none gap-2 data-[state=active]:bg-white data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary transition-all">
                        <Upload className="h-4 w-4" /> 本地上传
                      </TabsTrigger>
                      <TabsTrigger value="record" className="rounded-none gap-2 data-[state=active]:bg-white data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary transition-all">
                        <Mic className="h-4 w-4" /> 在线录音
                      </TabsTrigger>
                    </TabsList>
                    <div className="p-8">
                      <TabsContent value="upload" className="mt-0">
                        <AudioUploader onFileSelect={handleAudioSelected} />
                      </TabsContent>
                      <TabsContent value="record" className="mt-0">
                        <AudioRecorder onRecordingComplete={handleAudioSelected} />
                      </TabsContent>
                    </div>
                  </Tabs>
                </CardContent>
              </Card>

              {error && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-center font-medium">
                  {error}
                </div>
              )}
            </motion.div>
          )}

          {step === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="flex flex-col items-center justify-center py-20 space-y-8"
            >
              <div className="relative">
                <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                  <Sparkles className="h-10 w-10 text-primary" />
                </div>
                <Loader2 className="h-24 w-24 text-primary absolute top-0 left-0 animate-spin opacity-40" />
              </div>
              <div className="text-center space-y-6 max-w-xs">
                <h3 className="text-3xl editorial-serif font-bold tracking-tight">Analyzing Session Data...</h3>
                <p className="text-muted-foreground text-sm font-light italic">
                  Extracting phonetics, semantics, and temporal markers from your oral session.
                </p>
                <div className="space-y-3 pt-4">
                  <Progress value={progress} className="h-1 bg-slate-200 rounded-none overflow-hidden [&>div]:bg-foreground" />
                  <p className="label-caps px-0 text-right opacity-60">
                    Phase {Math.ceil(progress / 25)} · {Math.round(progress)}%
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'result' && analysis && (
            <motion.div
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-4xl mx-auto px-6 py-12 space-y-12"
            >
              {/* Result Header Info */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b-2 border-foreground">
                <div className="space-y-3">
                  <span className="label-caps px-0 text-primary font-bold">Analysis Complete</span>
                  <h2 className="text-6xl editorial-serif font-bold tracking-tighter">Transcript</h2>
                  <p className="text-muted-foreground text-sm flex items-center gap-2 italic">
                    <Headphones className="h-4 w-4" /> 共识别出 {analysis.sentences.length} 个句子。点击单词查看音标、释义与例句。
                  </p>
                </div>
                {audioUrl && (
                  <div className="bg-white p-4 border-2 border-foreground/10 flex items-center gap-4 shadow-sm">
                    <audio ref={audioRef} src={audioUrl} className="h-8 outline-none" controls />
                  </div>
                )}
              </div>

              {/* Sentences List */}
              <div className="grid gap-0 divide-y divide-border border-b border-border">
                {analysis.sentences.map((sentence, idx) => (
                  <SentenceCard 
                    key={idx} 
                    sentence={sentence} 
                    index={idx}
                    onPlayUserAudio={playSegment}
                    onWordSelect={(word) => {
                      stopAudioPlayback(); // Stop user audio when word is selected/played
                      setSelectedWord(word);
                      playTTS(word.word);
                    }}
                    selectedWord={selectedWord?.word}
                    isPlaying={activeSegmentIndex === idx}
                  />
                ))}
              </div>

              {/* Learning Guide Footer */}
              <div className="grid md:grid-cols-2 gap-8 pt-12">
                <Card className="bg-primary/5 border-none rounded-none p-8">
                  <div className="space-y-4">
                    <div className="h-12 w-12 bg-primary/10 flex items-center justify-center">
                      <Sparkles className="h-6 w-6 text-primary" />
                    </div>
                    <h4 className="editorial-serif text-2xl font-bold italic">Pronunciation Tips</h4>
                    <p className="text-sm text-slate-700 leading-relaxed font-light">
                      对比你的录音和标准范读。点击转录稿中的任意单词，即可在弹窗中查看精确的音标标注与实时释义。
                    </p>
                  </div>
                </Card>
                <Card className="bg-secondary/50 border-none rounded-none p-8">
                  <div className="space-y-4">
                    <div className="h-12 w-12 bg-black/5 flex items-center justify-center">
                      <Languages className="h-6 w-6 text-foreground" />
                    </div>
                    <h4 className="editorial-serif text-2xl font-bold italic">Contextual Learning</h4>
                    <p className="text-sm text-slate-700 leading-relaxed font-light">
                      AI 已经为您分析了所有词汇。遇到难点词汇时，反复点击单词进行纠音练习。
                    </p>
                  </div>
                </Card>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="mt-20 border-t border-border bg-slate-50 py-12">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="label-caps px-0 opacity-40">
            Powered by Gemini 2.0 & Oralis Engine
          </p>
          <div className="flex gap-8 label-caps px-0 opacity-40 text-[9px]">
            <span>Auto-Pause: Active</span>
            <span>Fidelity: High</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

const Badge = ({ children, className, variant = 'primary' }: { children: React.ReactNode, className?: string, variant?: 'primary' | 'secondary' | 'outline' }) => {
  const variants = {
    primary: 'bg-primary text-primary-foreground',
    secondary: 'bg-secondary text-secondary-foreground',
    outline: 'border border-slate-200 text-slate-900'
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}

