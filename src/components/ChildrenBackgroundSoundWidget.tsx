import React, { useState, useEffect } from 'react';
import {
  Music,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Sparkles,
  Smile,
  Sliders,
  ChevronDown,
  ChevronUp,
  X,
  Sun,
  Star,
  Gamepad2
} from 'lucide-react';
import { audioVoice, BgMusicTrack } from '../lib/audioVoice';

export const ChildrenBackgroundSoundWidget: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<BgMusicTrack>('playroom');
  const [volume, setVolume] = useState(0.16);
  const [isExpanded, setIsExpanded] = useState(false);
  const [sparkleActive, setSparkleActive] = useState(false);

  useEffect(() => {
    const unsub = audioVoice.subscribeBgState((playing, track, vol) => {
      setIsPlaying(playing);
      setCurrentTrack(track);
      setVolume(vol);
    });
    return () => unsub();
  }, []);

  const handleTogglePlay = () => {
    audioVoice.toggleBackgroundMusic(currentTrack);
  };

  const handleSelectTrack = (track: BgMusicTrack) => {
    setCurrentTrack(track);
    audioVoice.startBackgroundMusic(track);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    audioVoice.setBackgroundVolume(newVol);
  };

  const handleTriggerSparkle = () => {
    setSparkleActive(true);
    audioVoice.playChildGiggleSparkle();
    setTimeout(() => setSparkleActive(false), 800);
  };

  const tracks = [
    { id: 'playroom' as BgMusicTrack, label: 'Joyful Playroom', icon: '🧸', desc: 'Upbeat xylophone & glockenspiel' },
    { id: 'stars' as BgMusicTrack, label: 'Twinkling Stars', icon: '⭐', desc: 'Soothing music-box lullaby' },
    { id: 'sunny' as BgMusicTrack, label: 'Sunny Adventure', icon: '☀️', desc: 'Bouncy kalimba & happy rhythm' },
  ];

  return (
    <div className="fixed bottom-4 left-4 z-40 flex flex-col items-start select-none font-sans">
      {/* EXPANDED CONTROL PANEL */}
      {isExpanded && (
        <div className="mb-3 bg-white/95 backdrop-blur-md rounded-3xl p-4 sm:p-5 shadow-2xl border border-stone-200/90 w-80 max-w-[calc(100vw-2rem)] animate-fade-in text-slate-800">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-3.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-amber-400 text-slate-900 flex items-center justify-center font-bold text-xs shadow-2xs">
                🎵
              </div>
              <div>
                <h4 className="font-bold text-xs text-[#0F1E36] leading-none">Children’s Background Sound</h4>
                <span className="text-[10px] text-[#1A5336] font-semibold">Live Synthesizer Engine</span>
              </div>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-stone-100 transition-colors cursor-pointer"
              aria-label="Close sound panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Track Presets */}
          <div className="space-y-1.5 mb-4">
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Choose Sound Melody
            </label>
            {tracks.map((t) => (
              <button
                key={t.id}
                onClick={() => handleSelectTrack(t.id)}
                className={`w-full p-2 rounded-xl text-left border flex items-center justify-between transition-all cursor-pointer ${
                  currentTrack === t.id && isPlaying
                    ? 'bg-amber-50/80 border-amber-300 text-amber-950 shadow-2xs'
                    : 'bg-stone-50 border-stone-200 text-slate-700 hover:bg-stone-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{t.icon}</span>
                  <div>
                    <span className="font-bold text-xs block leading-tight">{t.label}</span>
                    <span className="text-[10px] text-slate-500 block leading-none mt-0.5">{t.desc}</span>
                  </div>
                </div>
                {currentTrack === t.id && isPlaying && (
                  <span className="flex items-center gap-0.5 h-3">
                    <span className="w-1 h-3 bg-amber-500 rounded-full animate-pulse" />
                    <span className="w-1 h-2 bg-amber-500 rounded-full animate-pulse delay-75" />
                    <span className="w-1 h-3.5 bg-amber-500 rounded-full animate-pulse delay-150" />
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Volume Control */}
          <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200 mb-3.5">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-600 flex items-center gap-1">
                <Volume2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Ambient Volume</span>
              </span>
              <span className="font-mono font-bold text-xs text-[#0F1E36]">
                {Math.round(volume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="0.4"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="w-full accent-[#1A5336] cursor-pointer h-1.5 bg-stone-200 rounded-lg appearance-none"
            />
          </div>

          {/* Sparkle Child FX Button */}
          <button
            onClick={handleTriggerSparkle}
            className={`w-full py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
              sparkleActive
                ? 'bg-amber-400 text-slate-900 border-amber-400 scale-95 shadow-md'
                : 'bg-gradient-to-r from-amber-50 to-emerald-50 hover:from-amber-100 hover:to-emerald-100 text-[#0F1E36] border-stone-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Play Magic Sparkle & Giggle FX</span>
          </button>
        </div>
      )}

      {/* COMPACT FLOATING CONTROLLER PILL */}
      <div className="flex items-center gap-1.5 bg-[#0F1E36]/90 backdrop-blur-md text-white p-1.5 sm:p-2 rounded-full border border-slate-700/80 shadow-xl hover:bg-[#0F1E36] transition-all">
        {/* Play/Pause Button */}
        <button
          onClick={handleTogglePlay}
          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
            isPlaying
              ? 'bg-amber-400 text-slate-900 shadow-md scale-105'
              : 'bg-white/10 hover:bg-white/20 text-white'
          }`}
          title={isPlaying ? 'Pause Background Sound' : 'Play Children Background Sound'}
          aria-label={isPlaying ? 'Pause Background Sound' : 'Play Children Background Sound'}
        >
          {isPlaying ? <Pause className="w-4 h-4 fill-slate-900" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
        </button>

        {/* Status Indicator & Title */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-white/10 transition-colors text-left cursor-pointer"
          title="Open Children Sound Controls"
        >
          <div className="hidden sm:block">
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-bold text-amber-300 truncate max-w-[120px]">
                {isPlaying ? tracks.find((t) => t.id === currentTrack)?.label : "Kids Background Sound"}
              </span>
              {isPlaying && (
                <span className="flex items-center gap-0.5 h-2.5">
                  <span className="w-0.5 h-2.5 bg-amber-400 rounded-full animate-bounce" />
                  <span className="w-0.5 h-1.5 bg-amber-400 rounded-full animate-bounce delay-100" />
                  <span className="w-0.5 h-3 bg-amber-400 rounded-full animate-bounce delay-200" />
                </span>
              )}
            </div>
            <span className="text-[9px] text-slate-300 block leading-none">
              {isPlaying ? 'Playing • Tap for options' : 'Tap to play melody'}
            </span>
          </div>

          <div className="p-1 text-slate-300">
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </div>
        </button>
      </div>
    </div>
  );
};
