import React, { useState, useRef, useEffect } from 'react';
import { Scenario, UserProfile, Attempt, Quest } from '../types';
import { INITIAL_SCENARIOS } from '../constants';
import { getAIFeedback } from '../services/geminiService';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment, arrayUnion } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Send, Sparkles, Award, Heart, Brain, CheckCircle2, XCircle, Info, Zap, Star, Sword, Terminal, Camera } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useSound } from '../hooks/useSound';

interface ChatbotProps {
  scenario: Scenario | null;
  onBack: () => void;
  onNextStage: (nextScenarioId: string) => void;
  profile: UserProfile | null;
}

type Step = 'visual' | 'quest' | 'result';

export default function Chatbot({ scenario, onBack, onNextStage, profile }: ChatbotProps) {
  const [currentStep, setCurrentStep] = useState<Step>('visual');
  const [currentQuestIndex, setCurrentQuestIndex] = useState(0);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [showSchoolping, setShowSchoolping] = useState(false);
  const [showWorldClearOverlay, setShowWorldClearOverlay] = useState(false);
  
  // State for the current quest
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [aiFeedbackText, setAiFeedbackText] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const { playSound } = useSound();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentQuestIndex, loading, aiFeedbackText]);

  if (!scenario) return null;

  const currentQuest = scenario.quests[currentQuestIndex];
  const isLastQuest = currentQuestIndex === scenario.quests.length - 1;

  const triggerSuccess = () => {
    playSound('SUCCESS');
    setShowSuccessOverlay(true);
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#00F2FF', '#7000FF', '#ffffff']
    });

    const currentIndex = INITIAL_SCENARIOS.findIndex(s => s.id === scenario.id);
    const nextScenario = INITIAL_SCENARIOS[currentIndex + 1];

    setTimeout(() => {
      setShowSuccessOverlay(false);
      
      if (scenario.isSchoolping) {
        setShowSchoolping(true);
      } else if (nextScenario && nextScenario.world !== scenario.world) {
        setShowWorldClearOverlay(true);
      } else {
        setCurrentStep('result');
      }
    }, 3000);
  };

  const handleNextQuest = () => {
    playSound('WHOOSH');
    if (isLastQuest) {
      triggerSuccess();
    } else {
      setCurrentQuestIndex(prev => prev + 1);
      setIsAnswered(false);
      setIsCorrect(null);
      setSelectedOption(null);
      setInput('');
      setAiFeedbackText(null);
    }
  };

  const saveAttempt = async (quest: Quest, userInput: string, correct: boolean, aiResult?: any) => {
    try {
      const attemptData: Attempt = {
        uid: auth.currentUser?.uid || '',
        scenarioId: scenario.id,
        questId: quest.id,
        userInput,
        isCorrect: correct,
        aiFeedback: aiResult?.feedback || '',
        scores: aiResult?.scores || { wordAppropriateness: 0, respect: 0, nonVerbal: 0 },
        timestamp: serverTimestamp()
      };
      await addDoc(collection(db, 'attempts'), attemptData);

      if (correct) {
        const userRef = doc(db, 'users', auth.currentUser?.uid || '');
        const updates: any = {
          exp: increment(10),
          competenceIndex: increment(5),
          wisdom: increment(5)
        };

        if (aiResult?.analysis) {
          updates['stats.cognitive'] = increment((aiResult.analysis.cognitive || 0) / 10);
          updates['stats.emotional'] = increment((aiResult.analysis.emotional || 0) / 10);
          updates['stats.behavioral'] = increment((aiResult.analysis.behavioral || 0) / 10);
        }

        if (isLastQuest) {
          updates.clearedStages = arrayUnion(scenario.id);
          const currentIndex = INITIAL_SCENARIOS.findIndex(s => s.id === scenario.id);
          const nextScenario = INITIAL_SCENARIOS[currentIndex + 1];
          if (nextScenario) {
            updates.unlockedStages = arrayUnion(nextScenario.id);
          }
          
          if (scenario.isBoss && !profile?.clearedWorlds?.includes(scenario.world)) {
            updates.clearedWorlds = arrayUnion(scenario.world);
            updates.badges = arrayUnion(`${scenario.world}-master`);
          }
        }

        await updateDoc(userRef, updates);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'attempts');
    }
  };

  const handleOptionSelect = async (option: string) => {
    if (isAnswered) return;
    playSound('WHOOSH');
    setSelectedOption(option);
    const correct = option === currentQuest.correctAnswer;
    setIsCorrect(correct);
    setIsAnswered(true);
    await saveAttempt(currentQuest, option, correct);
  };

  const handleShortAnswerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isAnswered) return;
    playSound('WHOOSH');
    
    const correct = input.trim() === currentQuest.correctAnswer;
    setIsCorrect(correct);
    setIsAnswered(true);
    await saveAttempt(currentQuest, input.trim(), correct);
  };

  const handleLongAnswerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading || isAnswered) return;
    playSound('WHOOSH');
    setLoading(true);

    try {
      // AI 피드백 생략 요청에 따라 바로 통과 처리
      const mockResult = {
        isPassed: true,
        feedback: '답변이 성공적으로 제출되었습니다. (AI 분석 생략)',
        scores: {
          wordAppropriateness: 100,
          respect: 100,
          nonVerbal: 100
        },
        analysis: {
          cognitive: 10,
          emotional: 10,
          behavioral: 10
        }
      };
      
      setAiFeedbackText(mockResult.feedback);
      setIsCorrect(mockResult.isPassed);
      setIsAnswered(true);
      setFeedback(mockResult);
      await saveAttempt(currentQuest, input, mockResult.isPassed, mockResult);
    } catch (error) {
      console.error("Error:", error);
      setAiFeedbackText('제출 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSchoolpingComplete = async () => {
    try {
      if (auth.currentUser) {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userRef, {
          schoolpingCompleted: arrayUnion(scenario.id)
        });
      }
    } catch (error) {
      console.error('Error saving schoolping completion:', error);
    }
    
    setShowSchoolping(false);
    
    const currentIndex = INITIAL_SCENARIOS.findIndex(s => s.id === scenario.id);
    const nextScenario = INITIAL_SCENARIOS[currentIndex + 1];
    
    if (nextScenario && nextScenario.world !== scenario.world) {
      setShowWorldClearOverlay(true);
    } else {
      setCurrentStep('result');
    }
  };

  const handleWorldClearComplete = () => {
    setShowWorldClearOverlay(false);
    setCurrentStep('result');
  };

  const currentScenarioIndex = INITIAL_SCENARIOS.findIndex(s => s.id === scenario.id);
  const totalScenarios = INITIAL_SCENARIOS.length;
  const progressPercentage = ((currentScenarioIndex + 1) / totalScenarios) * 100;

  return (
    <div className="h-full flex flex-col bg-cyber-bg text-white relative overflow-hidden">
      {/* Top Progress Bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-white/10 z-50">
        <motion.div 
          className="h-full bg-gradient-to-r from-cyber-blue to-cyber-purple shadow-[0_0_10px_#00F2FF]"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>

      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />
      
      {/* Top Bar */}
      <div className="bg-black/40 backdrop-blur-xl border-b border-white/5 px-8 py-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-6">
          <button onClick={() => { playSound('WHOOSH'); onBack(); }} className="w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-xl transition-all active:scale-90 border border-white/10 cyber-button">
            <ArrowLeft size={24} className="text-cyber-blue" />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              {scenario.isBoss && <span className="text-[10px] font-black text-cyber-purple uppercase tracking-widest bg-cyber-purple/10 px-2 py-0.5 rounded-full border border-cyber-purple/20 neon-text-purple">보스 스테이지</span>}
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight leading-none uppercase italic">{scenario.title}</h2>
          </div>
        </div>
        {currentStep === 'quest' && (
          <div className="flex gap-2">
            {scenario.quests.map((q, i) => (
              <div key={q.id} className={`w-8 h-2 rounded-full transition-all ${i === currentQuestIndex ? 'bg-cyber-blue shadow-[0_0_10px_#00F2FF]' : i < currentQuestIndex ? 'bg-cyber-blue/30' : 'bg-white/10'}`} />
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-8 relative z-10" ref={scrollRef}>
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            {currentStep === 'visual' && (
              <motion.div key="visual" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="space-y-8">
                {/* Combined Card */}
                <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl mb-8">
                  {/* Background Image */}
                  <div className="absolute inset-0 z-0">
                    <img src={scenario.mediaUrl} alt="상황 일러스트" className="w-full h-full object-cover opacity-30" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-black" />
                  </div>

                  {/* Content */}
                  <div className="relative z-10 p-8 md:p-10">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-cyber-blue/20 rounded-xl flex items-center justify-center text-cyber-blue border border-cyber-blue/30 shadow-[0_0_15px_rgba(0,242,255,0.2)] backdrop-blur-md">
                        <Sparkles size={24} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-cyber-purple tracking-widest uppercase mb-1">
                          {scenario.world === 'forest' ? '우정의 숲' : scenario.world === 'sea' ? '공감의 바다' : scenario.world === 'city' ? '자립의 도시' : '내면의 성'}
                        </h3>
                        <h4 className="text-3xl font-black text-white tracking-tight neon-text-blue italic">{scenario.title}</h4>
                      </div>
                    </div>
                    
                    <div className="bg-black/40 backdrop-blur-md border-l-4 border-cyber-blue p-6 rounded-r-xl">
                      <p className="text-slate-200 text-lg md:text-xl leading-relaxed font-medium whitespace-pre-line">
                        {scenario.situation}
                      </p>
                    </div>
                  </div>
                  <div className="scanline" />
                </div>

                <button 
                  onClick={() => { playSound('WHOOSH'); setCurrentStep('quest'); }}
                  className="w-full py-5 bg-cyber-blue text-black font-black text-2xl rounded-xl hover:bg-white hover:text-cyber-blue transition-all shadow-[0_0_20px_rgba(0,242,255,0.4)] uppercase tracking-widest italic transform hover:-translate-y-1"
                >
                  도전하기
                </button>
              </motion.div>
            )}

            {currentStep === 'quest' && currentQuest && (
              <motion.div key={`quest-${currentQuestIndex}`} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="space-y-8">
                <div className="cyber-card p-10 hologram-border">
                  <div className="flex items-center gap-3 text-cyber-blue mb-8">
                    <div className="w-10 h-10 bg-cyber-blue/10 rounded-lg flex items-center justify-center border border-cyber-blue/30">
                      <Brain size={24} />
                    </div>
                    <span className="font-black uppercase tracking-widest text-sm">퀘스트 {currentQuestIndex + 1} / {scenario.quests.length}</span>
                  </div>
                  <h3 className="text-3xl font-black text-white mb-10 leading-tight italic">{currentQuest.question}</h3>
                  
                  {/* Multiple Choice */}
                  {currentQuest.type === 'multiple-choice' && (
                    <div className="grid grid-cols-1 gap-4">
                      {currentQuest.options?.map((option, i) => (
                        <button
                          key={i}
                          onClick={() => handleOptionSelect(option)}
                          disabled={isAnswered}
                          className={`w-full p-6 rounded-xl text-left font-bold text-lg transition-all border-2 flex items-center justify-between group ${
                            isAnswered && option === selectedOption
                              ? isCorrect 
                                ? 'bg-cyber-blue/20 border-cyber-blue text-cyber-blue shadow-[0_0_15px_rgba(0,242,255,0.2)]' 
                                : 'bg-red-500/20 border-red-500 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                              : isAnswered && option === currentQuest.correctAnswer
                                ? 'bg-cyber-blue/20 border-cyber-blue text-cyber-blue' 
                                : 'bg-white/5 border-white/10 hover:border-cyber-blue/50 text-slate-400'
                          }`}
                        >
                          {option}
                          {isAnswered && option === selectedOption && (
                            isCorrect ? <CheckCircle2 size={24} /> : <XCircle size={24} />
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Short Answer */}
                  {currentQuest.type === 'short-answer' && (
                    <form onSubmit={handleShortAnswerSubmit} className="space-y-4">
                      <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-cyber-blue to-cyber-purple rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition-opacity pointer-events-none" />
                        <input
                          type="text"
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          disabled={isAnswered}
                          placeholder="정답을 입력하세요..."
                          className="relative w-full p-6 pr-20 rounded-xl bg-black/60 border-2 border-white/10 focus:border-cyber-blue transition-all outline-none shadow-xl text-lg font-medium text-white disabled:opacity-50"
                        />
                        {!isAnswered && (
                          <button
                            type="submit"
                            disabled={!input.trim()}
                            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 h-12 bg-cyber-blue text-black rounded-lg flex items-center justify-center gap-2 hover:bg-white disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none disabled:cursor-not-allowed transition-all active:scale-90 shadow-[0_0_15px_rgba(0,242,255,0.4)] font-bold"
                          >
                            <Send size={18} /> 입력
                          </button>
                        )}
                      </div>
                      {isAnswered && (
                        <div className={`p-4 rounded-xl border ${isCorrect ? 'bg-cyber-blue/10 border-cyber-blue/30 text-cyber-blue' : 'bg-red-500/10 border-red-500/30 text-red-400'} flex items-center gap-3`}>
                          {isCorrect ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
                          <span className="font-bold text-lg">
                            {isCorrect ? '정답입니다!' : `오답입니다. 정답은 "${currentQuest.correctAnswer}" 입니다.`}
                          </span>
                        </div>
                      )}
                    </form>
                  )}

                  {/* Long Answer (AI Evaluation) */}
                  {currentQuest.type === 'long-answer' && (
                    <div className="space-y-6">
                      <div className="bg-cyber-purple/10 p-6 rounded-2xl border border-cyber-purple/30 flex gap-4 items-center">
                        <div className="w-10 h-10 bg-black/40 rounded-lg flex items-center justify-center text-cyber-purple border border-cyber-purple/30 shadow-[0_0_10px_rgba(112,0,255,0.2)]">
                          <Info size={20} />
                        </div>
                        <p className="text-sm font-bold text-cyber-purple">AI가 당신의 답변을 분석하여 피드백을 제공합니다. 상황에 맞게 자유롭게 작성해보세요.</p>
                      </div>

                      <form onSubmit={handleLongAnswerSubmit} className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-cyber-blue to-cyber-purple rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition-opacity pointer-events-none" />
                        <textarea
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          disabled={isAnswered || loading}
                          placeholder="여기에 답변을 작성하세요..."
                          rows={4}
                          className="relative w-full p-6 rounded-xl bg-black/60 border-2 border-white/10 focus:border-cyber-blue transition-all outline-none shadow-xl text-lg font-medium text-white disabled:opacity-50 resize-none"
                        />
                        {!isAnswered && (
                          <div className="flex justify-end mt-4 relative z-10">
                            <button
                              type="submit"
                              disabled={!input.trim() || loading}
                              className="px-8 py-4 bg-cyber-blue text-black rounded-xl font-black uppercase tracking-widest flex items-center gap-2 hover:bg-white disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none disabled:cursor-not-allowed transition-all active:scale-90 shadow-[0_0_15px_rgba(0,242,255,0.4)]"
                            >
                              {loading ? <span className="animate-pulse">분석 중...</span> : <><Send size={20} /> 제출하기</>}
                            </button>
                          </div>
                        )}
                      </form>

                      {aiFeedbackText && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`p-6 rounded-2xl border backdrop-blur-md ${isCorrect ? 'bg-cyber-blue/20 border-cyber-blue text-white shadow-[0_0_15px_rgba(0,242,255,0.2)]' : 'bg-cyber-purple/20 border-cyber-purple text-white shadow-[0_0_15px_rgba(112,0,255,0.2)]'}`}>
                          <div className="flex items-center gap-3 mb-4">
                            {isCorrect ? <CheckCircle2 className="text-cyber-blue" size={24} /> : <Brain className="text-cyber-purple" size={24} />}
                            <h4 className="font-black text-xl italic">{isCorrect ? '훌륭합니다!' : 'AI 피드백'}</h4>
                          </div>
                          <p className="text-lg leading-relaxed">{aiFeedbackText}</p>
                        </motion.div>
                      )}
                    </div>
                  )}

                  {/* Next Button */}
                  {isAnswered && (isCorrect || currentQuest.type !== 'long-answer') && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-10">
                      <button 
                        onClick={handleNextQuest}
                        className="w-full py-6 cyber-button cyber-button-primary text-xl font-black uppercase tracking-widest italic"
                      >
                        {isLastQuest ? '미션 완료' : '다음 퀘스트'}
                      </button>
                    </motion.div>
                  )}
                  {isAnswered && !isCorrect && currentQuest.type === 'long-answer' && (
                     <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
                     <button 
                       onClick={() => { setIsAnswered(false); setAiFeedbackText(null); }}
                       className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/20 rounded-xl text-lg font-bold transition-all"
                     >
                       다시 시도하기
                     </button>
                   </motion.div>
                  )}
                  <div className="scanline" />
                </div>
              </motion.div>
            )}

            {currentStep === 'result' && (
              <motion.div key="result" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto">
                <div className="cyber-card p-12 hologram-border text-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-2 bg-cyber-blue" />
                  <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyber-blue/10 rounded-full blur-3xl" />
                  
                  <motion.div 
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', damping: 12 }}
                    className="w-28 h-28 bg-gradient-to-br from-cyber-blue to-cyber-purple rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(0,242,255,0.4)] text-black"
                  >
                    <Award size={56} />
                  </motion.div>
                  
                  <h2 className="text-5xl font-black text-white mb-4 tracking-tighter italic neon-text-blue">퀘스트 클리어!</h2>
                  <p className="text-slate-400 text-lg mb-12 font-medium">모든 전술적 통신 목표를 달성했습니다.</p>
                  
                  {feedback?.scores && (
                    <div className="grid grid-cols-3 gap-6 mb-12">
                      <ResultStatCard label="적절성" value={feedback.scores.wordAppropriateness || 0} icon={<Zap size={16} />} color="blue" />
                      <ResultStatCard label="존중" value={feedback.scores.respect || 0} icon={<Heart size={16} />} color="purple" />
                      <ResultStatCard label="조화" value={feedback.scores.nonVerbal || 0} icon={<Sparkles size={16} />} color="blue" />
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10 flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-cyber-blue/10 rounded-xl flex items-center justify-center text-cyber-blue border border-cyber-blue/30 shadow-[0_0_10px_rgba(0,242,255,0.2)]">
                          <Star size={24} fill="currentColor" />
                        </div>
                        <div className="text-left">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">획득한 보상</p>
                          <p className="text-xl font-black text-white leading-none">+{scenario.quests.length * 10} EXP</p>
                        </div>
                      </div>
                      <div className="h-10 w-[1px] bg-white/10" />
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">유능감 지수</p>
                        <p className="text-xl font-black text-cyber-purple leading-none">+{scenario.quests.length * 5} CI</p>
                      </div>
                    </div>

                    <button 
                      onClick={() => { playSound('WHOOSH'); onNextStage(scenario.id); }} 
                      className="w-full py-6 cyber-button cyber-button-primary text-xl font-black uppercase tracking-widest italic mb-4"
                    >
                      다음 스테이지로 이동
                    </button>
                    <button onClick={() => { playSound('WHOOSH'); onBack(); }} className="w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl text-lg font-bold uppercase tracking-widest transition-colors">
                      월드 맵으로 귀환
                    </button>
                  </div>
                  <div className="scanline" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Schoolping Overlay */}
      <AnimatePresence>
        {showSchoolping && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-8"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="max-w-xl w-full cyber-card p-10 hologram-border relative"
            >
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-cyber-purple rounded-full flex items-center justify-center shadow-[0_0_30px_#7000FF] border-4 border-black">
                <Camera size={40} className="text-white" />
              </div>
              
              <div className="text-center mt-8 mb-8">
                <h2 className="text-3xl font-black text-white mb-2 italic neon-text-purple">스쿨핑 미션 해제!</h2>
                <p className="text-cyber-blue font-bold tracking-widest uppercase text-sm">Real-world Cooperative Mission</p>
              </div>
              
              <div className="bg-white/5 border border-white/10 p-6 rounded-xl mb-8">
                <h3 className="text-xl font-bold text-white mb-4">현실 세계에서 배운 화법을 실천하세요!</h3>
                <p className="text-slate-300 leading-relaxed">
                  보스 스테이지를 클리어한 당신에게 특별한 임무가 주어졌습니다. 
                  주변 친구나 가족에게 배운 대화법을 사용해보고, 그 순간을 사진으로 남겨 인증하세요.
                </p>
              </div>

              <button 
                onClick={handleSchoolpingComplete}
                className="w-full py-5 bg-cyber-purple text-white rounded-xl font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all shadow-[0_0_20px_rgba(112,0,255,0.4)]"
              >
                미션 수락 및 보상 확인
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Overlay */}
      <AnimatePresence>
        {showSuccessOverlay && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.5, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', damping: 12 }}
              className="text-center"
            >
              <div className="w-32 h-32 bg-cyber-blue rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_#00F2FF]">
                <Award size={64} className="text-black" />
              </div>
              <h1 className="text-6xl font-black text-white mb-4 tracking-tighter italic neon-text-blue">
                미션 성공!
              </h1>
              <p className="text-2xl text-cyber-blue font-bold uppercase tracking-widest">
                유능감을 획득했습니다
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* World Clear Overlay */}
      <AnimatePresence>
        {showWorldClearOverlay && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-8"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="max-w-xl w-full cyber-card p-10 hologram-border relative text-center"
            >
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-amber-500 rounded-full flex items-center justify-center shadow-[0_0_30px_#f59e0b] border-4 border-black">
                <Star size={40} className="text-white" />
              </div>
              
              <div className="mt-8 mb-8">
                <h2 className="text-4xl font-black text-white mb-2 italic neon-text-blue">월드 클리어!</h2>
                <p className="text-amber-500 font-bold tracking-widest uppercase text-lg">새로운 월드가 열렸습니다</p>
              </div>
              
              <div className="bg-white/5 border border-white/10 p-6 rounded-xl mb-8">
                <p className="text-slate-300 leading-relaxed text-lg">
                  축하합니다! 이 월드의 모든 미션을 성공적으로 완수했습니다.
                  이제 다음 월드로 나아가 더 큰 도전을 맞이하세요.
                </p>
              </div>

              <button 
                onClick={handleWorldClearComplete}
                className="w-full py-5 bg-amber-500 text-black rounded-xl font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all shadow-[0_0_20px_rgba(245,158,11,0.4)]"
              >
                계속하기
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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

interface ResultStatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: 'blue' | 'purple';
}

function ResultStatCard({ label, value, icon, color }: ResultStatCardProps) {
  const colors = {
    blue: 'bg-cyber-blue/10 text-cyber-blue border-cyber-blue/30',
    purple: 'bg-cyber-purple/10 text-cyber-purple border-cyber-purple/30'
  };

  return (
    <div className={`p-5 rounded-xl border-2 ${colors[color]}`}>
      <div className="flex items-center justify-center gap-1.5 mb-2 opacity-60">
        {icon}
        <p className="text-[10px] font-black uppercase tracking-widest">{label}</p>
      </div>
      <p className="text-3xl font-black tracking-tighter">{value}</p>
    </div>
  );
}
