import React, { useState, useEffect } from 'react';
import { auth, signIn, logOut, db } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { UserProfile, Scenario } from './types';
import { INITIAL_SCENARIOS } from './constants';
import WorldMap from './components/WorldMap';
import Chatbot from './components/Chatbot';
import Dashboard from './components/Dashboard';
import Schoolping from './components/Schoolping';
import { Layout, Map as MapIcon, BarChart3, Users, LogOut, ShieldCheck, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSound } from './hooks/useSound';

import { initializeDatabase } from './initData';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'map' | 'chat' | 'dashboard' | 'schoolping'>('map');
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const { playSound } = useSound();

  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        // Only admin initializes database
        if (u.email === 'reuben119@gmail.com') {
          initializeDatabase();
        }
        
        const docRef = doc(db, 'users', u.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
        } else {
          const newProfile: UserProfile = {
            uid: u.uid,
            displayName: u.displayName || '학생',
            email: u.email || '',
            exp: 0,
            wisdom: 0,
            level: 1,
            badges: [],
            role: u.email === 'reuben119@gmail.com' ? 'admin' : 'student',
            stats: { cognitive: 0, emotional: 0, behavioral: 0 },
            clearedWorlds: [],
            unlockedStages: ['stage-1'], // Start with stage 1 unlocked
            clearedStages: [],
            competenceIndex: 0,
            schoolpingCompleted: []
          };
          await setDoc(docRef, newProfile);
          setProfile(newProfile);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
      setIsSigningIn(false);
    });
    return unsubscribe;
  }, []);

  // Listen for profile updates
  useEffect(() => {
    if (user) {
      const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (doc) => {
        if (doc.exists()) {
          setProfile(doc.data() as UserProfile);
        }
      });
      return unsubscribe;
    }
  }, [user]);

  const handleNavClick = (newView: typeof view) => {
    playSound('WHOOSH');
    setView(newView);
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#050505]">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-[#00F2FF] border-t-transparent rounded-full shadow-[0_0_15px_rgba(0,242,255,0.5)]"
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#050505] overflow-hidden relative">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1],
              rotate: [0, 90, 0]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-1/4 -left-1/4 w-full h-full bg-[#7000FF]/20 blur-[120px] rounded-full"
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.5, 1],
              opacity: [0.1, 0.3, 0.1],
              rotate: [0, -120, 0]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-1/4 -right-1/4 w-full h-full bg-[#00F2FF]/20 blur-[120px] rounded-full"
          />
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full px-6 text-center relative z-10"
        >
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#00F2FF]/10 border border-[#00F2FF]/20 rounded-full text-[#00F2FF] text-[10px] font-mono font-bold mb-8 uppercase tracking-[0.3em]"
          >
            <ShieldCheck size={14} />
            최고의 소셜 어드벤처
          </motion.div>

          <h1 className="text-7xl md:text-9xl font-black text-white mb-6 tracking-tighter leading-none">
            <span className="neon-text-purple">소셜</span><br/>
            <span className="neon-text-blue">톡</span>
          </h1>

          <p className="text-slate-400 text-lg md:text-xl mb-12 max-w-lg mx-auto leading-relaxed font-light">
            국어 화법과 사회성을 키우는 즐거운 모험!<br/>
            당신의 대화 스킬을 레벨업하고 세상을 구하세요.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={async () => {
                if (isSigningIn) return;
                playSound('WHOOSH');
                setIsSigningIn(true);
                try {
                  await signIn();
                } catch (error: any) {
                  console.error('Sign in error:', error);
                  setIsSigningIn(false);
                  if (error.code !== 'auth/cancelled-popup-request' && error.code !== 'auth/popup-closed-by-user') {
                    alert('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
                  }
                }
              }}
              disabled={isSigningIn}
              className="cyber-button-primary px-12 py-5 text-lg group shung-animation disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="flex items-center justify-center gap-3">
                {isSigningIn ? '연결 중...' : '모험 시작'}
                {!isSigningIn && (
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  >
                    →
                  </motion.span>
                )}
              </span>
            </button>
            
            <div className="text-slate-500 text-[10px] font-mono uppercase tracking-[0.2em]">
              1,240명 이상의 플레이어와 함께하세요
            </div>
          </div>
        </motion.div>

        {/* Bottom Decorative Rail */}
        <div className="absolute bottom-12 left-0 w-full overflow-hidden whitespace-nowrap opacity-10 pointer-events-none">
          <motion.div 
            animate={{ x: [0, -1000] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="flex gap-12 text-white font-black text-4xl uppercase italic"
          >
            <span>대화는 힘이다 • 말하기 실력을 키워라 • 소셜 모험이 기다린다 • 대화의 기술을 마스터하라 • </span>
            <span>대화는 힘이다 • 말하기 실력을 키워라 • 소셜 모험이 기다린다 • 대화의 기술을 마스터하라 • </span>
          </motion.div>
        </div>
        <div className="scanline" />
      </div>
    );
  }

  const handleSelectScenario = (scenario: Scenario) => {
    playSound('WHOOSH');
    setSelectedScenario(scenario);
    setView('chat');
  };

  const handleNextStage = (currentScenarioId: string) => {
    playSound('WHOOSH');
    const currentIndex = INITIAL_SCENARIOS.findIndex(s => s.id === currentScenarioId);
    const nextScenario = INITIAL_SCENARIOS[currentIndex + 1];
    
    if (nextScenario) {
      setSelectedScenario(nextScenario);
      // Force re-render of Chatbot by momentarily setting view to something else or just updating state
      // Since Chatbot uses scenario prop, it will re-render, but we need to reset its internal state.
      // We can use a key on Chatbot to force remount.
    } else {
      setView('map');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#050505] overflow-hidden text-slate-200">
      {/* Header - Game Dashboard Style */}
      <header className="bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#00F2FF] to-[#7000FF] rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-[0_0_15px_rgba(0,242,255,0.3)]">S</div>
            <div className="hidden lg:block">
              <h2 className="font-black text-white tracking-tight leading-none">소셜톡</h2>
              <p className="text-[10px] text-[#00F2FF] font-mono font-bold uppercase tracking-[0.2em] mt-1">시스템 온라인</p>
            </div>
          </div>

          <div className="h-10 w-[1px] bg-white/10 hidden lg:block" />

          {/* Player Stats Rail */}
          <div className="hidden xl:flex items-center gap-6">
            <div className="space-y-1">
              <p className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-widest">플레이어 레벨</p>
              <div className="flex items-center gap-2">
                <span className="text-[#00F2FF] font-mono font-black">LV.{profile?.level}</span>
                <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/10">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(profile?.exp || 0) % 100}%` }}
                    className="h-full bg-gradient-to-r from-[#00F2FF] to-[#7000FF]"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-widest">지혜 포인트</p>
              <p className="text-[#7000FF] font-mono font-black">{profile?.wisdom?.toLocaleString()} WP</p>
            </div>
          </div>
        </div>
        
        <nav className="hidden md:flex items-center gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/5">
          <NavBtn active={view === 'map'} onClick={() => handleNavClick('map')} icon={<MapIcon size={18}/>} label="월드 맵" />
          <NavBtn active={view === 'dashboard'} onClick={() => handleNavClick('dashboard')} icon={<BarChart3 size={18}/>} label="플레이어 통계" />
          <NavBtn active={view === 'schoolping'} onClick={() => handleNavClick('schoolping')} icon={<Users size={18}/>} label="길드 미션" />
        </nav>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-black text-white uppercase tracking-tight">{profile?.displayName}</p>
            <p className="text-[10px] text-[#00F2FF] font-mono font-bold uppercase tracking-widest">{profile?.role === 'admin' ? '게임 마스터' : '모험가'}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shadow-[0_0_10px_rgba(0,242,255,0.1)]">
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.displayName}`} alt="Avatar" className="w-full h-full object-cover" />
          </div>
          <button onClick={() => { playSound('WHOOSH'); logOut(); }} className="p-2 text-slate-500 hover:text-red-500 transition-colors">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {view === 'map' && (
            <motion.div key="map" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
              <WorldMap onSelectScenario={handleSelectScenario} profile={profile} />
            </motion.div>
          )}
          {view === 'chat' && (
            <motion.div key={`chat-${selectedScenario?.id}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full">
              <Chatbot scenario={selectedScenario} onBack={() => handleNavClick('map')} onNextStage={handleNextStage} profile={profile} />
            </motion.div>
          )}
          {view === 'dashboard' && (
            <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full overflow-y-auto">
              <Dashboard profile={profile} />
            </motion.div>
          )}
          {view === 'schoolping' && (
            <motion.div key="schoolping" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full overflow-y-auto">
              <Schoolping profile={profile} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Mobile Nav */}
      <nav className="md:hidden bg-[#0a0a0a] border-t border-white/5 px-6 py-3 flex items-center justify-around">
        <MobileNavBtn active={view === 'map'} onClick={() => handleNavClick('map')} icon={<MapIcon size={24}/>} />
        <MobileNavBtn active={view === 'dashboard'} onClick={() => handleNavClick('dashboard')} icon={<BarChart3 size={24}/>} />
        <MobileNavBtn active={view === 'schoolping'} onClick={() => handleNavClick('schoolping')} icon={<Users size={24}/>} />
      </nav>
    </div>
  );
}

function NavBtn({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-mono text-xs tracking-widest shung-animation ${
        active ? 'bg-[#00F2FF]/10 text-[#00F2FF] shadow-[0_0_10px_rgba(0,242,255,0.2)] border border-[#00F2FF]/20' : 'text-slate-500 hover:text-slate-300'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function MobileNavBtn({ active, onClick, icon }: { active: boolean, onClick: () => void, icon: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`p-2 rounded-xl transition-all shung-animation ${
        active ? 'text-[#00F2FF] bg-[#00F2FF]/10' : 'text-slate-600'
      }`}
    >
      {icon}
    </button>
  );
}
