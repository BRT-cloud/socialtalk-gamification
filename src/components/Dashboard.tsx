import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { db } from '../firebase';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { motion } from 'motion/react';
import { Award, TrendingUp, Users, BookOpen, Calendar, Brain, Zap, Shield, Heart, Star, Sparkles, Sword, Crown, CheckCircle2, XCircle } from 'lucide-react';

interface DashboardProps {
  profile: UserProfile | null;
}

export default function Dashboard({ profile }: DashboardProps) {
  const [recentAttempts, setRecentAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!profile) return;
      
      let q;
      if (profile.role === 'admin') {
        q = query(collection(db, 'attempts'), orderBy('timestamp', 'desc'), limit(10));
      } else {
        q = query(
          collection(db, 'attempts'), 
          where('uid', '==', profile.uid),
          orderBy('timestamp', 'desc'), 
          limit(10)
        );
      }
      
      const querySnapshot = await getDocs(q);
      const attempts = querySnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
      setRecentAttempts(attempts);
      setLoading(false);
    }
    fetchData();
  }, [profile]);

  const getTitle = (level: number) => {
    if (level >= 20) return '전설의 현자';
    if (level >= 15) return '소통의 마스터';
    if (level >= 10) return '협상의 전문가';
    if (level >= 5) return '소셜 모험가';
    return '초보 대화꾼';
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 bg-slate-950 min-h-full">
      <div className="flex flex-col lg:flex-row gap-10">
        {/* Left Column: Character Card */}
        <div className="lg:w-1/3 space-y-10">
          <div className="glass-morphism rounded-[3.5rem] p-10 shadow-2xl border-b-[12px] border-emerald-600 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full -mr-24 -mt-24 transition-transform group-hover:scale-110" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full -ml-16 -mb-16 opacity-50" />
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="relative mb-8">
                <motion.div 
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  className="absolute -inset-4 bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-400 rounded-[3rem] opacity-20 blur-xl"
                />
                <div className="w-40 h-40 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-[3rem] flex items-center justify-center text-white text-6xl font-black shadow-2xl shadow-emerald-200 relative z-10 rotate-3">
                  {profile?.displayName?.[0] || 'S'}
                </div>
                <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-amber-400 rounded-2xl flex items-center justify-center text-white shadow-lg border-4 border-white z-20">
                  <Crown size={24} />
                </div>
              </div>

              <h2 className="text-4xl font-black text-slate-900 mb-2 tracking-tighter">{profile?.displayName}</h2>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 mb-8">
                <Sword size={14} />
                <span className="font-black uppercase tracking-widest text-[10px]">{getTitle(profile?.level || 1)}</span>
              </div>
              
              <div className="w-full space-y-3">
                <div className="flex justify-between items-end px-1">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">레벨 {profile?.level}</span>
                  <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">{(profile?.exp || 0) % 100} / 100 XP</span>
                </div>
                <div className="w-full bg-slate-900 h-8 rounded-2xl overflow-hidden border-4 border-white/10 shadow-inner">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(profile?.exp || 0) % 100}%` }}
                    className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 neon-glow" 
                  />
                </div>
              </div>
            </div>

            <div className="mt-12 grid grid-cols-2 gap-6">
              <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2 opacity-60">
                  <Sparkles size={14} className="text-blue-500" />
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">지혜</p>
                </div>
                <p className="text-3xl font-black text-blue-600 tracking-tighter">{profile?.wisdom || 0} <span className="text-sm">WP</span></p>
              </div>
              <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2 opacity-60">
                  <Zap size={14} className="text-amber-500" />
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">총 경험치</p>
                </div>
                <p className="text-3xl font-black text-amber-600 tracking-tighter">{profile?.exp || 0}</p>
              </div>
              <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow col-span-2 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2 opacity-60">
                    <Shield size={14} className="text-emerald-500" />
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">유능감 지수 (CI)</p>
                  </div>
                  <p className="text-4xl font-black text-emerald-600 tracking-tighter">{profile?.competenceIndex || 0}</p>
                </div>
                <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-500">
                  <TrendingUp size={32} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Quests & History */}
        <div className="lg:flex-1 space-y-10">
          <div className="glass-morphism rounded-[3.5rem] p-10 shadow-2xl border border-white/10">
            <div className="flex items-center justify-between mb-10">
              <h3 className="font-black text-white flex items-center gap-4 text-2xl tracking-tight">
                <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center text-amber-500">
                  <Award size={24} />
                </div>
                수집한 배지
              </h3>
              <span className="px-4 py-1.5 bg-white/5 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest border border-white/10">
                {profile?.badges.length}개 획득
              </span>
            </div>
            <div className="flex flex-wrap gap-8">
              {profile?.badges.length === 0 ? (
                <div className="w-full py-16 flex flex-col items-center justify-center bg-white/5 rounded-[3rem] border-4 border-dashed border-white/10">
                  <Award size={64} className="text-white/10 mb-4" />
                  <p className="text-slate-500 font-black text-lg">아직 수집한 배지가 없습니다. 모험을 시작하세요!</p>
                </div>
              ) : (
                profile?.badges.map((badge, i) => {
                  const isCompetence = badge.startsWith('competence-stage-');
                  const stageNum = isCompetence ? badge.split('-')[2] : '';
                  
                  return (
                    <motion.div 
                      key={i} 
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className={`w-24 h-24 rounded-[2rem] flex flex-col items-center justify-center border-4 border-white/10 shadow-xl relative group ${
                        isCompetence 
                          ? 'bg-gradient-to-br from-cyber-blue/20 to-cyber-purple/20 text-cyber-blue' 
                          : 'bg-gradient-to-br from-amber-400/20 to-orange-400/20 text-amber-500'
                      }`}
                      title={isCompetence ? `스테이지 ${stageNum} 유능감 배지` : badge}
                    >
                      <Award size={36} />
                      {isCompetence && (
                        <span className="text-[10px] font-black mt-1">STAGE {stageNum}</span>
                      )}
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white border-4 border-white shadow-lg scale-0 group-hover:scale-100 transition-transform">
                        <Star size={14} fill="currentColor" />
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>

          <div className="glass-morphism rounded-[3.5rem] p-10 shadow-2xl border border-white/10">
            <div className="flex items-center justify-between mb-10">
              <h3 className="font-black text-white flex items-center gap-4 text-2xl tracking-tight">
                <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-500">
                  <BookOpen size={24} />
                </div>
                퀘스트 로그
              </h3>
              <div className="flex items-center gap-2 text-slate-500">
                <Calendar size={18} />
                <span className="text-[10px] font-black uppercase tracking-widest">최근 활동</span>
              </div>
            </div>
            
            <div className="space-y-6">
              {recentAttempts.length === 0 ? (
                <div className="w-full py-16 flex flex-col items-center justify-center bg-white/5 rounded-[3rem] border-4 border-dashed border-white/10">
                  <BookOpen size={64} className="text-white/10 mb-4" />
                  <p className="text-slate-500 font-black text-lg">아직 완료한 퀘스트가 없습니다.</p>
                </div>
              ) : (
                recentAttempts.map((attempt) => (
                  <div key={attempt.id} className="group flex items-center justify-between p-8 rounded-[2.5rem] bg-white/5 border-2 border-transparent hover:bg-white/10 hover:shadow-2xl hover:border-emerald-500/50 transition-all cursor-pointer">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm group-hover:bg-emerald-500 group-hover:text-white transition-all group-hover:rotate-6">
                        <Star size={28} fill="currentColor" />
                      </div>
                      <div>
                        <p className="font-black text-white text-xl leading-none mb-2">{attempt.scenarioId}</p>
                        <p className="text-sm text-slate-400 font-bold truncate max-w-[200px] md:max-w-md italic">"{attempt.userInput}"</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-4xl font-black text-emerald-500 leading-none tracking-tighter">
                        {attempt.scores ? (((attempt.scores.clarity || 0) + (attempt.scores.emotionalAuthenticity || 0) + (attempt.scores.skillApplication || 0)) / 3).toFixed(0) : (attempt.isCorrect ? '100' : '0')}
                      </p>
                      <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-2">점수</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Teacher Dashboard (Admin Only) */}
      {profile?.role === 'admin' && (
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 rounded-[4rem] p-12 text-white shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full -mr-48 -mt-48 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full -ml-32 -mb-32 blur-3xl" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-6 mb-12">
              <div className="w-20 h-20 bg-emerald-500 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-emerald-500/20 rotate-6">
                <Users size={40} />
              </div>
              <div>
                <h2 className="text-4xl font-black tracking-tighter">길드 마스터 대시보드</h2>
                <p className="text-emerald-400 font-black uppercase tracking-widest text-xs mt-1">교사 관리 및 인사이트</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-16">
              <AdminStat label="활성 학생" value="24" icon={<Users size={24} />} />
              <AdminStat label="학급 진행도" value="68%" icon={<TrendingUp size={24} />} />
              <AdminStat label="오늘의 퀘스트" value="156" icon={<Zap size={24} />} />
            </div>

            <div className="bg-white/5 rounded-[3rem] p-10 border border-white/10 backdrop-blur-md">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-black text-emerald-400 uppercase tracking-widest text-sm">최근 학생 인사이트</h3>
                <button className="text-[10px] font-black text-white/40 uppercase tracking-widest hover:text-white transition-colors">모든 로그 보기</button>
              </div>
              <div className="space-y-6">
                {recentAttempts.slice(0, 5).map((attempt, i) => (
                  <div key={i} className="bg-white/5 p-6 rounded-3xl border border-white/5 flex items-center justify-between hover:bg-white/10 transition-all group">
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-black text-lg group-hover:scale-110 transition-transform">
                        {i + 1}
                      </div>
                      <p className="text-lg text-white/80 italic font-medium">"{attempt.userInput}"</p>
                    </div>
                    <div className="px-4 py-2 bg-white/5 rounded-xl text-[10px] font-black text-white/30 uppercase tracking-widest">
                      {attempt.scenarioId}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function AdminStat({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
  return (
    <div className="bg-white/10 p-10 rounded-[2.5rem] border border-white/10 hover:bg-white/15 transition-all hover:-translate-y-2 group">
      <div className="flex items-center gap-4 mb-6 text-emerald-400 group-hover:scale-110 transition-transform">
        {icon}
        <p className="text-white/60 text-[10px] font-black uppercase tracking-widest">{label}</p>
      </div>
      <p className="text-5xl font-black tracking-tighter">{value}</p>
    </div>
  );
}
