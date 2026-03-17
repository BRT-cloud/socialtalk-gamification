import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, SchoolpingMission } from '../types';
import { db, auth } from '../firebase';
import { collection, onSnapshot, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Users, CheckCircle2, MessageSquare, Image as ImageIcon, Sparkles, Tent, Moon, Star, X, Upload } from 'lucide-react';
import { useSound } from '../hooks/useSound';

interface SchoolpingProps {
  profile: UserProfile | null;
}

export default function Schoolping({ profile }: SchoolpingProps) {
  const [missions, setMissions] = useState<SchoolpingMission[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null);
  const [submissionText, setSubmissionText] = useState('');
  const [submissionImage, setSubmissionImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { playSound } = useSound();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'schoolping'), (snapshot) => {
      const missionData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SchoolpingMission));
      setMissions(missionData);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const resizedBase64 = await resizeImage(file);
        setSubmissionImage(resizedBase64);
      } catch (error) {
        console.error("Error resizing image:", error);
      }
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMissionId || (!submissionText.trim() && !submissionImage)) return;
    
    playSound('WHOOSH');
    setUploading(selectedMissionId);
    
    // Fallback image if none provided
    const imageUrl = submissionImage || `https://picsum.photos/seed/${Math.random()}/800/600`;
    
    try {
      const missionRef = doc(db, 'schoolping', selectedMissionId);
      await updateDoc(missionRef, {
        submissions: arrayUnion({
          uid: auth.currentUser?.uid,
          userName: profile?.displayName || '익명',
          imageUrl: imageUrl,
          text: submissionText.trim(),
          timestamp: new Date().toISOString()
        })
      });

      // Update user profile
      if (auth.currentUser) {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userRef, {
          schoolpingCompleted: arrayUnion(selectedMissionId)
        });
      }

      setSelectedMissionId(null);
      setSubmissionText('');
      setSubmissionImage(null);
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setUploading(null);
    }
  };

  const handleGuildChatClick = () => {
    playSound('WHOOSH');
    // Guild chat logic here
  };

  if (loading) return (
    <div className="h-full flex items-center justify-center bg-[#050505]">
      <motion.div 
        animate={{ rotate: 360 }} 
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }} 
        className="w-12 h-12 border-4 border-[#00F2FF] border-t-transparent rounded-full shadow-[0_0_15px_rgba(0,242,255,0.5)]" 
      />
    </div>
  );

  return (
    <div className="min-h-full bg-[#050505] relative overflow-hidden pb-20">
      {/* Night Sky Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#0a0a1a] to-[#050505]" />
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.7 + 0.3,
            }}
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 p-6 md:p-12 max-w-7xl mx-auto space-y-12">
        {/* Hero Section - Guild Mission Board */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="cyber-card p-8 md:p-12 relative overflow-hidden border-[#7000FF]/50"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 text-[#7000FF]">
            <Tent size={240} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-2 h-2 bg-[#00F2FF] rounded-full animate-pulse shadow-[0_0_8px_#00F2FF]" />
              <span className="text-[#00F2FF] font-mono text-sm tracking-[0.2em] uppercase">Active Guild Event</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter leading-none">
              <span className="neon-text-purple">GUILD</span><br/>
              <span className="neon-text-blue">MISSION BOARD</span>
            </h1>
            <p className="text-slate-300 text-lg md:text-xl max-w-2xl leading-relaxed font-light">
              밤하늘 아래 모여든 모험가들의 캠프파이어. <br/>
              친구들과 함께 미션을 수행하고, 실시간으로 공유되는 모험의 기록을 확인하세요.
            </p>
          </div>
          <div className="scanline" />
        </motion.div>

        {/* Stats Bar - Bento Style */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Missions', value: missions.length, color: 'blue' },
            { label: 'Guild Members', value: '1,240', color: 'purple' },
            { label: 'Success Rate', value: '94%', color: 'blue' },
            { label: 'Guild Rank', value: '#12', color: 'purple' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="cyber-card p-6 border-white/5"
            >
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em] mb-2">{stat.label}</p>
              <p className={`text-3xl font-black ${stat.color === 'blue' ? 'text-[#00F2FF]' : 'text-[#7000FF]'}`}>
                {stat.value}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Mission List */}
        <div className="space-y-12">
          {missions.length === 0 ? (
            <div className="cyber-card py-32 text-center border-dashed border-white/10">
              <p className="text-slate-500 font-mono text-xl uppercase tracking-widest">No Active Missions Found</p>
            </div>
          ) : (
            missions.map((mission, idx) => {
              const hasCompleted = profile?.schoolpingCompleted?.includes(mission.id);
              
              return (
              <motion.div 
                key={mission.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="group relative"
              >
                {/* Decorative Number */}
                <div className="absolute -top-12 -left-6 text-[12rem] font-black text-white/[0.03] pointer-events-none select-none">
                  {String(idx + 1).padStart(2, '0')}
                </div>

                <div className="cyber-card p-8 md:p-12 relative z-10 overflow-hidden border-white/10 hover:border-[#00F2FF]/30 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8 mb-12">
                    <div className="space-y-6 flex-1">
                      <div className="flex flex-wrap items-center gap-4">
                        <span className="bg-[#7000FF]/20 text-[#7000FF] border border-[#7000FF]/30 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em]">
                          Mission {idx + 1}
                        </span>
                        <span className="text-[#00F2FF] font-mono text-[10px] uppercase tracking-[0.2em] flex items-center gap-2">
                          <Users size={14} />
                          {mission.submissions.length} Adventurers Completed
                        </span>
                        {hasCompleted && (
                          <span className="bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] flex items-center gap-1">
                            <CheckCircle2 size={12} />
                            Completed
                          </span>
                        )}
                      </div>
                      <h3 className="text-4xl md:text-5xl font-black text-white tracking-tight">{mission.title}</h3>
                      <p className="text-slate-400 text-lg font-light max-w-3xl leading-relaxed">{mission.description}</p>
                    </div>

                    <div className="flex flex-col sm:flex-row lg:flex-col gap-4 min-w-[240px]">
                      {!hasCompleted && (
                        <button
                          onClick={() => { playSound('WHOOSH'); setSelectedMissionId(mission.id); }}
                          className="cyber-button-primary py-5 px-8 flex items-center justify-center gap-3 group/btn shung-animation"
                        >
                          <Camera size={20} className="group-hover/btn:rotate-12 transition-transform" />
                          <span className="font-black tracking-tighter text-lg">
                            SUBMIT PROOF
                          </span>
                        </button>
                      )}
                      <button 
                        onClick={handleGuildChatClick}
                        className="cyber-button-outline py-4 px-8 flex items-center justify-center gap-2 shung-animation"
                      >
                        <MessageSquare size={18} />
                        <span className="font-bold text-sm tracking-widest">GUILD CHAT</span>
                      </button>
                    </div>
                  </div>

                  {/* Submissions Gallery - Live Feed Style */}
                  <div className="space-y-8">
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                      <div className="flex items-center gap-3">
                        <Sparkles size={18} className="text-[#00F2FF]" />
                        <h4 className="font-mono text-xs text-white uppercase tracking-[0.3em]">Live Adventure Feed</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Real-time</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      <AnimatePresence mode="popLayout">
                        {mission.submissions.map((sub, i) => (
                          <motion.div 
                            key={sub.timestamp + i}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative aspect-[3/4] rounded-xl overflow-hidden border border-white/10 group/item"
                          >
                            <img 
                              src={sub.imageUrl} 
                              alt="Proof" 
                              className="w-full h-full object-cover transition-transform duration-700 group-hover/item:scale-110" 
                              referrerPolicy="no-referrer" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity flex flex-col justify-end p-4">
                              <p className="text-[#00F2FF] font-black text-[10px] uppercase tracking-widest mb-1">{sub.userName}</p>
                              {sub.text && <p className="text-white text-xs line-clamp-2 mb-2">{sub.text}</p>}
                              <p className="text-white/40 text-[8px] font-mono">{new Date(sub.timestamp).toLocaleTimeString()}</p>
                            </div>
                            <div className="absolute top-2 right-2">
                              <div className="w-2 h-2 bg-[#00F2FF] rounded-full shadow-[0_0_8px_#00F2FF]" />
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                      
                      {!hasCompleted && (
                        <motion.div 
                          whileHover={{ scale: 1.02 }}
                          onClick={() => { playSound('WHOOSH'); setSelectedMissionId(mission.id); }}
                          className="aspect-[3/4] rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-white/20 gap-3 hover:border-[#00F2FF]/30 hover:text-[#00F2FF]/50 transition-all cursor-pointer bg-white/[0.02]"
                        >
                          <ImageIcon size={32} strokeWidth={1} />
                          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-center px-4">Waiting for your story</span>
                        </motion.div>
                      )}
                    </div>
                  </div>
                  <div className="scanline opacity-20" />
                </div>
              </motion.div>
            )})
          )}
        </div>
      </div>

      {/* Submission Modal */}
      <AnimatePresence>
        {selectedMissionId && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-2xl cyber-card p-8 relative"
            >
              <button 
                onClick={() => {
                  setSelectedMissionId(null);
                  setSubmissionText('');
                  setSubmissionImage(null);
                }}
                className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
              
              <h2 className="text-3xl font-black text-white mb-2 italic neon-text-blue">미션 인증하기</h2>
              <p className="text-slate-400 mb-8">현실에서 미션을 수행한 경험을 공유해주세요.</p>

              <form onSubmit={handleUpload} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-cyber-blue uppercase tracking-widest mb-2">사진 업로드 (선택)</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-48 border-2 border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center text-white/50 hover:text-white hover:border-cyber-blue/50 transition-colors cursor-pointer overflow-hidden relative"
                  >
                    {submissionImage ? (
                      <img src={submissionImage} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <Upload size={32} className="mb-2" />
                        <span className="text-sm font-bold">클릭하여 이미지 선택</span>
                      </>
                    )}
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageChange} 
                    accept="image/*" 
                    className="hidden" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-cyber-blue uppercase tracking-widest mb-2">경험 공유</label>
                  <textarea
                    value={submissionText}
                    onChange={(e) => setSubmissionText(e.target.value)}
                    placeholder="미션을 수행하면서 느낀 점이나 재미있었던 에피소드를 적어주세요..."
                    className="w-full p-4 bg-black/50 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:border-cyber-blue outline-none resize-none h-32"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={uploading === selectedMissionId || (!submissionText.trim() && !submissionImage)}
                  className="w-full py-4 cyber-button cyber-button-primary text-lg font-black uppercase tracking-widest italic disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none disabled:cursor-not-allowed"
                >
                  {uploading === selectedMissionId ? '업로드 중...' : '제출하기'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Decoration */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#7000FF]/10 to-transparent pointer-events-none" />
    </div>
  );
}
