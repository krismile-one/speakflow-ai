import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { User, Volume2, Pause } from 'lucide-react';
import { SentenceAnalysis, WordInfo } from '@/src/services/geminiService';
import { playTTS } from '@/src/lib/tts';
import { motion } from 'motion/react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface SentenceCardProps {
  sentence: SentenceAnalysis;
  onPlayUserAudio: (index: number, start: number, end: number) => void;
  index: number;
  onWordSelect: (word: WordInfo) => void;
  selectedWord?: string;
  isPlaying?: boolean;
}

export const SentenceCard: React.FC<SentenceCardProps> = ({ 
  sentence, 
  onPlayUserAudio, 
  index, 
  onWordSelect,
  selectedWord,
  isPlaying
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="overflow-hidden border-none border-b border-border shadow-none rounded-none rounded-t-none bg-transparent hover:bg-black/[0.02] transition-colors group">
        <CardContent className="p-8">
          <div className="flex flex-col gap-6">
            {/* Tag/Number */}
            <div className="flex items-center gap-2 mb-2">
              <span className="label-caps px-0">
                Sentence {index + 1}
              </span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-30">
                · {sentence.startTime.toFixed(1)}s - {sentence.endTime.toFixed(1)}s
              </span>
            </div>

            {/* Transcription with clickable words using Popover */}
            <div className="flex flex-wrap gap-x-3 gap-y-4 leading-normal">
              {sentence.words.map((wordObj, i) => (
                <WordPopover 
                  key={i} 
                  wordData={wordObj} 
                  onSelect={() => onWordSelect(wordObj)}
                  isSelected={selectedWord === wordObj.word}
                />
              ))}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPlayUserAudio(index, sentence.startTime, sentence.endTime)}
                className={`rounded-sm gap-2 text-[10px] label-caps py-4 h-9 shadow-none transition-all ${
                  isPlaying 
                    ? 'bg-primary text-white border-primary' 
                    : 'bg-transparent border-border hover:bg-primary hover:text-white'
                }`}
              >
                {isPlaying ? <Pause className="h-3 w-3" /> : <User className="h-3 w-3" />}
                {isPlaying ? 'Pause Audio' : 'My Audio'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Standard reading also pauses user audio if active
                  onWordSelect({ word: sentence.text, ipa: '', meaning: '' }); 
                  playTTS(sentence.text);
                }}
                className="rounded-sm gap-2 text-[10px] label-caps py-4 h-9 bg-primary/5 border-primary/20 text-primary hover:bg-primary hover:text-white transition-all shadow-none"
              >
                <Volume2 className="h-3.5 w-3.5" />
                Native Guide
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

const WordPopover: React.FC<{ 
  wordData: WordInfo, 
  onSelect: () => void,
  isSelected: boolean 
}> = ({ wordData, onSelect, isSelected }) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          onClick={onSelect}
          className={`text-3xl editorial-serif transition-all cursor-pointer border-b-2 ${
            isSelected 
              ? 'text-primary border-primary font-bold' 
              : 'text-foreground/50 hover:text-primary border-transparent hover:border-primary/40'
          }`}
        >
          {wordData.word}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 shadow-2xl border-none overflow-hidden rounded-xl bg-white/95 backdrop-blur-md">
        <div className="p-8 space-y-6">
          <div className="space-y-2">
            <span className="label-caps px-0 text-primary">Word Insights</span>
            <div className="flex justify-between items-center">
              <h4 className="editorial-serif text-5xl font-bold tracking-tighter">{wordData.word}</h4>
              <button
                className="h-12 w-12 rounded-full border border-foreground flex items-center justify-center hover:bg-foreground hover:text-white transition-colors"
                onClick={() => playTTS(wordData.word)}
              >
                <Volume2 className="h-5 w-5" />
              </button>
            </div>
            <p className="text-2xl text-primary font-light italic leading-tight">/{wordData.ipa}/</p>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-1">
              <p className="label-caps text-primary opacity-80">Definition</p>
              <p className="text-sm leading-relaxed font-medium text-slate-800">{wordData.meaning}</p>
            </div>

            {wordData.example && (
              <div className="space-y-1 pt-4 border-t border-slate-100">
                <p className="label-caps text-primary opacity-80">Usage Example</p>
                <p className="text-sm text-slate-600 italic">"{wordData.example}"</p>
              </div>
            )}
          </div>
          
          <Button className="w-full label-caps py-7 rounded-none bg-foreground text-white hover:bg-slate-800" onClick={onSelect}>
            Add to Vocabulary
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
