import React, { useRef } from 'react';
import { WORLDS, INITIAL_SCENARIOS } from '../constants';
import { UserProfile, Scenario } from '../types';
import { motion } from 'motion/react';
import { Lock, Star, Trophy, Map as MapIcon, ChevronRight, Sparkles, Sword, CheckCircle2 } from 'lucide-react';
import { useSound } from '../hooks/useSound';

interface WorldMapProps {
  onSelectScenario: (scenario: Scenario) => void;
  profile: UserProfile | null;
}

const WORLD_IMAGES: Record<string, string> = {
  forest: 'https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&q=80&w=1000',
  sea: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&q=80&w=1000',
  city: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&q=80&w=1000',
  castle: 'https://images.unsplash.com/photo-1533154683836-84ea7a0bc310?auto=format&fit=crop&q=80&w=1000',
};

export default function WorldMap({ onSelectScenario, profile }: WorldMapProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { playSound } = useSound();

  const isStageUnlocked = (scenario: Scenario) => {
    if (!profile) return false;
    return profile.unlockedStages?.includes(scenario.id) || scenario.id === 'stage-1';
  };

  const handleScenarioClick = (scenario: Scenario) => {
    playSound('WHOOSH');
    onSelectScenario(scenario);
  };

  return (
    <div className="h-full flex flex-col bg-cyber-bg overflow-hidden relative">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      
      {/* Header */}
      <div className="relative z-10 px-8 pt-8 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-cyber-purple/20 border border-cyber-purple rounded-xl flex items-center justify-center text-cyber-purple shadow-[0_0_15px_rgba(112,0,255,0.3)]">
            <MapIcon size={24} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white tracking-tighter neon-text-purple">월드 탐험</h2>
            <p className="text-[10px] font-bold text-cyber-blue uppercase tracking-[0.2em]">목적지를 선택하세요</p>
          </div>
        </div>

        <div className="flex gap-6">
          <div className="cyber-card px-6 py-3 flex items-center gap-4">
            <div className="w-10 h-10 bg-cyber-blue/10 rounded-lg flex items-center justify-center text-cyber-blue">
              <Star size={20} fill="currentColor" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">경험치</p>
              <p className="text-xl font-black text-white leading-none">{profile?.exp}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Horizontal World Scroll */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-x-auto overflow-y-hidden flex items-center px-8 gap-8 no-scrollbar"
      >
        {WORLDS.map((world) => {
          const worldScenarios = INITIAL_SCENARIOS.filter(s => s.world === world.id).sort((a, b) => a.stage - b.stage);
          const isCleared = profile?.clearedWorlds.includes(world.id);

          return (
            <div key={world.id} className="flex-shrink-0 w-[450px] h-[80%] flex flex-col gap-6">
              {/* World Card */}
              <motion.div 
                whileHover={{ scale: 1.02, y: -5 }}
                className="relative flex-1 rounded-3xl overflow-hidden border-2 border-cyber-blue/30 shadow-[0_0_30px_rgba(0,242,255,0.1)] group"
              >
                <img 
                  src={WORLD_IMAGES[world.id]} 
                  alt={world.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-25"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                
                <div className="absolute inset-0 p-8 flex flex-col justify-end">
                  <div className="bg-black/70 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-2xl">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-3 h-3 rounded-full ${isCleared ? 'bg-cyber-blue shadow-[0_0_10px_#00F2FF]' : 'bg-slate-500'}`} />
                      <span className="text-xs font-bold uppercase tracking-widest text-cyber-blue">
                        {isCleared ? '안전 구역' : '미개척 지역'}
                      </span>
                    </div>
                    <h3 className="text-5xl font-black text-white tracking-tighter mb-4 neon-text-blue uppercase italic drop-shadow-[0_0_10px_rgba(0,242,255,0.5)]">
                      {world.name}
                    </h3>
                    <p className="text-slate-200 text-sm leading-relaxed mb-6 line-clamp-2 font-medium">
                      {world.desc}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-2">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className="w-8 h-8 rounded-full border-2 border-black bg-cyber-purple/30 backdrop-blur-sm flex items-center justify-center text-[10px] font-bold">
                            {i}
                          </div>
                        ))}
                        <div className="w-8 h-8 rounded-full border-2 border-black bg-black/50 backdrop-blur-sm flex items-center justify-center text-[10px] font-bold text-slate-400">
                          +12
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-cyber-blue font-bold text-sm">
                        <span>스테이지 보기</span>
                        <ChevronRight size={16} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Scanline Effect */}
                <div className="scanline" />
              </motion.div>

              {/* Stage Quick Select */}
              <div className="h-48 cyber-card p-4 flex gap-4 overflow-x-auto no-scrollbar">
                {worldScenarios.map((scenario) => {
                  const unlocked = isStageUnlocked(scenario);
                  const isCleared = profile?.clearedStages?.includes(scenario.id);
                  return (
                    <motion.button
                      key={scenario.id}
                      whileHover={unlocked ? { scale: 1.05, y: -2 } : {}}
                      whileTap={unlocked ? { scale: 0.95 } : {}}
                      onClick={() => unlocked && handleScenarioClick(scenario)}
                      className={`relative flex-shrink-0 w-32 h-full rounded-xl border overflow-hidden transition-all ${
                        unlocked 
                          ? isCleared
                            ? 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                            : scenario.isBoss 
                              ? 'border-cyber-purple shadow-[0_0_15px_rgba(112,0,255,0.3)]'
                              : 'border-cyber-blue/30 hover:border-cyber-blue/60 shadow-[0_0_15px_rgba(0,242,255,0.1)]'
                          : 'border-white/5 opacity-50 grayscale'
                      }`}
                    >
                      {/* Stage Image Background */}
                      <div className="absolute inset-0 z-0">
                        <img 
                          src={scenario.mediaUrl} 
                          alt={scenario.title}
                          className="w-full h-full object-cover opacity-20 group-hover:opacity-40 transition-opacity"
                          referrerPolicy="no-referrer"
                        />
                        <div className={`absolute inset-0 bg-gradient-to-t ${
                          isCleared ? 'from-emerald-900/90' : scenario.isBoss ? 'from-cyber-purple/90' : 'from-black/90'
                        } to-transparent`} />
                      </div>

                      <div className="relative z-10 flex flex-col items-center justify-center gap-1 h-full p-2 bg-black/70 backdrop-blur-[4px]">
                        {isCleared && (
                          <div className="absolute top-1 right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_15px_#10b981] z-20">
                            <CheckCircle2 size={12} className="text-black" />
                          </div>
                        )}
                        <div className="flex items-center justify-center mb-1">
                          {unlocked ? (
                            scenario.isBoss ? <Sword size={22} className={isCleared ? 'text-emerald-400' : 'text-cyber-purple drop-shadow-[0_0_10px_rgba(112,0,255,0.8)]'} /> : <Sparkles size={20} className={isCleared ? 'text-emerald-400' : 'text-cyber-blue drop-shadow-[0_0_10px_rgba(0,242,255,0.8)]'} />
                          ) : (
                            <Lock size={20} className="text-slate-500" />
                          )}
                        </div>
                        <span className="text-3xl font-black tracking-tighter text-white leading-none drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">{scenario.stage}</span>
                        <span className="text-[9px] font-black uppercase tracking-widest truncate w-full px-1 text-center text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                          {scenario.title}
                        </span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Coming Soon Card */}
        <div className="flex-shrink-0 w-[450px] h-[80%] rounded-3xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-4 bg-white/5">
          <Trophy size={64} className="text-white/10" />
          <p className="text-xl font-black text-white/20 uppercase tracking-[0.3em]">새로운 영역 준비 중</p>
        </div>
      </div>

      {/* Footer Progress */}
      <div className="px-8 py-6 bg-black/40 backdrop-blur-xl border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-cyber-blue animate-pulse" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">시스템 상태: 온라인</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">글로벌 진행도</span>
            <div className="w-48 h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '32%' }}
                className="h-full bg-gradient-to-r from-cyber-purple to-cyber-blue"
              />
            </div>
            <span className="text-[10px] font-bold text-cyber-blue">32%</span>
          </div>
        </div>
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          사이버 판타지 OS v2.4.0
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
