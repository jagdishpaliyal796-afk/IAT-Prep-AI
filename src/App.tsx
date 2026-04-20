/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  GraduationCap, 
  LayoutDashboard, 
  Send, 
  BrainCircuit, 
  Clock, 
  Award, 
  ChevronRight, 
  AlertCircle,
  CheckCircle2,
  XCircle,
  RefreshCcw,
  MessageSquare,
  Image as ImageIcon,
  Upload,
  X,
  Sparkles,
  Box
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Question, Subject, TestResult, ChatMessage } from './types';
import { IAT_QUESTIONS } from './data/mockQuestions';
import { askStudyAssistant, getDetailedFeedback, generateExplanationImage } from './services/aiService';
import VisualLab from './components/VisualLab';

type View = 'dashboard' | 'test' | 'study' | 'results' | 'lab';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedSubject, setSelectedSubject] = useState<Subject | 'All'>('All');
  
  // Test State
  const [testQuestions, setTestQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>([]);
  const [testStartedTime, setTestStartedTime] = useState(0);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiFeedback, setAiFeedback] = useState("");

  // Study State
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPendingImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearPendingImage = () => {
    setPendingImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Initialize Test
  const startTest = (subject: Subject | 'All') => {
    let filteredQuestions = IAT_QUESTIONS;
    if (subject !== 'All') {
      filteredQuestions = IAT_QUESTIONS.filter(q => q.subject === subject);
    }
    // Shuffle and pick a few (simulating a representative test)
    const shuffled = [...filteredQuestions].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 10); // 10 questions for a quick test
    
    setTestQuestions(selected);
    setCurrentQuestionIndex(0);
    setSelectedAnswers(new Array(selected.length).fill(null));
    setTestStartedTime(Date.now());
    setCurrentView('test');
    setAiFeedback("");
  };

  const handleAnswerSelect = (optionIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = optionIndex;
    setSelectedAnswers(newAnswers);
  };

  const submitTest = async () => {
    setIsSubmitting(true);
    const score = selectedAnswers.reduce((acc, ans, idx) => {
      return ans === testQuestions[idx].correctAnswer ? acc + 1 : acc;
    }, 0);

    const detail = testQuestions.map((q, idx) => ({
      questionId: q.id,
      selectedOption: selectedAnswers[idx],
      isCorrect: selectedAnswers[idx] === q.correctAnswer,
      subject: q.subject
    }));

    const result: TestResult = {
      score,
      total: testQuestions.length,
      answers: detail,
      timestamp: Date.now()
    };

    setTestResult(result);
    setCurrentView('results');
    
    // Get AI Feedback
    const feedback = await getDetailedFeedback(score, testQuestions.length, detail);
    setAiFeedback(feedback);
    setIsSubmitting(false);
  };

  // Study Assistant logic
  const handleSendMessage = async () => {
    if (!userInput.trim() && !pendingImage) return;

    const currentPendingImage = pendingImage;
    const currentInput = userInput;
    
    const newUserMsg: ChatMessage = { 
      role: 'user', 
      content: currentInput || (currentPendingImage ? "Analyzing image..." : ""),
      image: currentPendingImage || undefined
    };
    
    setChatHistory(prev => [...prev, newUserMsg]);
    setUserInput("");
    setPendingImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setIsTyping(true);

    let imagePayload = undefined;
    if (currentPendingImage) {
      const [mimeInfo, base64Data] = currentPendingImage.split(',');
      const mimeType = mimeInfo.match(/:(.*?);/)?.[1] || 'image/jpeg';
      imagePayload = { data: base64Data, mimeType };
    }

    const aiResponse = await askStudyAssistant(currentInput || "Explain this image in context of IAT prep.", imagePayload);
    const newAiMsg: ChatMessage = { role: 'model', content: aiResponse.text || "I'm not sure how to answer that." };
    setChatHistory(prev => [...prev, newAiMsg]);
    setIsTyping(false);
  };

  const handleVisualize = async () => {
    if (!userInput.trim()) return;
    
    const context = userInput;
    const newUserMsg: ChatMessage = { role: 'user', content: `Visualize for me: ${context}` };
    setChatHistory(prev => [...prev, newUserMsg]);
    setUserInput("");
    setIsTyping(true);

    const imageUrl = await generateExplanationImage(context);
    if (imageUrl) {
      const newAiMsg: ChatMessage = { 
        role: 'model', 
        content: `Here is a visualization for: ${context}`, 
        image: imageUrl 
      };
      setChatHistory(prev => [...prev, newAiMsg]);
    } else {
      setChatHistory(prev => [...prev, { role: 'model', content: "I couldn't generate a visualization for that right now." }]);
    }
    setIsTyping(false);
  };

  return (
    <div className="min-h-screen bg-bg-dark text-text-primary font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-sidebar-dark/80 backdrop-blur-md border-b border-border-dark px-6 py-4 flex items-center justify-between">
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => setCurrentView('dashboard')}
          id="app-logo"
        >
          <div className="bg-brand-gold p-2 rounded-xl">
            <BrainCircuit className="text-bg-dark w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-brand-gold">
            IAT Prep AI
          </h1>
        </div>
        
        <nav className="flex items-center gap-6">
          <button 
            onClick={() => setCurrentView('dashboard')}
            className={`flex items-center gap-2 text-sm font-medium transition-colors ${currentView === 'dashboard' ? 'text-brand-gold' : 'text-text-secondary hover:text-brand-gold'}`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </button>
          <button 
            onClick={() => setCurrentView('study')}
            className={`flex items-center gap-2 text-sm font-medium transition-colors ${currentView === 'study' ? 'text-brand-gold' : 'text-text-secondary hover:text-brand-gold'}`}
          >
            <MessageSquare className="w-4 h-4" />
            Study AI
          </button>
          <button 
            onClick={() => setCurrentView('lab')}
            className={`flex items-center gap-2 text-sm font-medium transition-colors ${currentView === 'lab' ? 'text-brand-gold' : 'text-text-secondary hover:text-brand-gold'}`}
          >
            <Box className="w-4 h-4" />
            3D Lab
          </button>
        </nav>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {/* Dashboard View */}
          {currentView === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
              id="dashboard-view"
            >
              <section className="text-center space-y-4 pt-8">
                <motion.h2 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-4xl md:text-5xl font-extrabold text-text-primary tracking-tight"
                >
                  Master the IAT with AI Precision
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-lg text-text-secondary max-w-2xl mx-auto"
                >
                  Personalized practice, real-time study assistance, and deep analytics to help you secure your spot in IISER.
                </motion.p>
              </section>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Practice Card */}
                <motion.div 
                  whileHover={{ y: -5 }}
                  className="bg-card-dark p-8 rounded-3xl border border-border-dark shadow-sm hover:shadow-brand-gold/10 transition-all group"
                >
                  <div className="bg-item-dark w-12 h-12 rounded-2xl flex items-center justify-center mb-6 text-brand-gold group-hover:scale-110 transition-transform">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-brand-gold">Practice Tests</h3>
                  <p className="text-text-secondary mb-6 leading-relaxed">
                    Take curated tests across Biology, Chemistry, Maths, and Physics. Get instant feedback and AI-powered performance analysis.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-3 mb-8">
                    {['Physics', 'Chemistry', 'Biology', 'Mathematics'].map((subj) => (
                      <button 
                        key={subj}
                        onClick={() => startTest(subj as Subject)}
                        className="text-xs px-4 py-2 bg-item-dark hover:bg-brand-gold hover:text-bg-dark rounded-full border border-border-dark transition-colors font-semibold text-text-secondary"
                      >
                        {subj}
                      </button>
                    ))}
                  </div>

                  <button 
                    onClick={() => startTest('All')}
                    className="w-full bg-brand-gold text-bg-dark py-4 rounded-2xl font-bold shadow-lg shadow-brand-gold/20 hover:bg-brand-gold/90 transition-all flex items-center justify-center gap-2"
                  >
                    Start Full Practice <ChevronRight className="w-5 h-5" />
                  </button>
                </motion.div>

                {/* 3D Lab Card */}
                <motion.div 
                  whileHover={{ y: -5 }}
                  className="bg-card-dark p-8 rounded-3xl border border-border-dark shadow-sm hover:shadow-brand-gold/10 transition-all group"
                >
                  <div className="bg-item-dark w-12 h-12 rounded-2xl flex items-center justify-center mb-6 text-brand-gold group-hover:scale-110 transition-transform">
                    <Box className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-brand-gold">Interactive 3D Lab</h3>
                  <p className="text-text-secondary mb-6 leading-relaxed">
                    Step into our immersive virtual lab. Visualize complex 3D structures like DNA, atomic orbitals, and mathematical surfaces.
                  </p>
                  <div className="flex gap-4 mb-8">
                    <div className="flex -space-x-3">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="w-10 h-10 rounded-full border-2 border-bg-dark bg-item-dark flex items-center justify-center text-[10px] font-bold text-brand-gold">
                          3D
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-text-secondary italic">Now with Real-time Physics & Orbitals</p>
                  </div>
                  <button 
                    onClick={() => setCurrentView('lab')}
                    className="w-full bg-transparent text-brand-gold border-2 border-brand-gold py-4 rounded-2xl font-bold hover:bg-brand-gold/5 transition-all flex items-center justify-center gap-2"
                  >
                    Enter 3D Lab <ChevronRight className="w-5 h-5" />
                  </button>
                </motion.div>
              </div>

              {/* AI Assistant Banner */}
              <motion.div 
                whileHover={{ scale: 1.01 }}
                className="bg-item-dark/50 border border-border-dark p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6"
              >
                  <div className="flex items-center gap-6">
                    <div className="bg-brand-gold/10 p-4 rounded-2xl text-brand-gold">
                      <MessageSquare className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-text-primary">AI Study Buddy</h3>
                      <p className="text-text-secondary">Ask questions, explain images, and get personalized study paths.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setCurrentView('study')}
                    className="bg-brand-gold text-bg-dark px-8 py-4 rounded-2xl font-bold hover:bg-brand-gold/90 transition shadow-lg shadow-brand-gold/20"
                  >
                    Start Chatting
                  </button>
              </motion.div>

              {/* Stats/Features Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { icon: Clock, title: 'Timed Practice', desc: 'Simulate real exam pressure.' },
                  { icon: Award, title: 'Detailed Feedback', desc: 'AI analyzes your weak spots.' },
                  { icon: BrainCircuit, title: 'Concept Mastery', desc: 'Step-by-step help for complex topics.' },
                ].map((feature, i) => (
                  <div key={i} className="flex items-start gap-4 p-4">
                    <div className="bg-item-dark p-2 rounded-lg">
                      <feature.icon className="w-5 h-5 text-brand-gold" />
                    </div>
                    <div>
                      <h4 className="font-bold text-text-primary">{feature.title}</h4>
                      <p className="text-sm text-text-secondary">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Practice Test View */}
          {currentView === 'test' && testQuestions.length > 0 && (
            <motion.div
              key="test"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-8"
              id="test-view"
            >
              <div className="flex items-center justify-between pb-4 border-b border-border-dark">
                <div className="flex items-center gap-4">
                  <div className="bg-item-dark px-3 py-1 rounded-full text-brand-gold font-bold text-sm border border-border-dark">
                    Q {currentQuestionIndex + 1} / {testQuestions.length}
                  </div>
                  <span className="text-sm font-semibold text-brand-gold bg-item-dark px-2 py-1 rounded border border-border-dark/50">
                    {testQuestions[currentQuestionIndex].subject}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-text-secondary font-mono">
                  <Clock className="w-4 h-4" />
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-item-dark h-2 rounded-full overflow-hidden">
                <motion.div 
                  className="bg-brand-gold h-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentQuestionIndex + 1) / testQuestions.length) * 100}%` }}
                />
              </div>

              <div className="bg-card-dark p-8 rounded-3xl border border-border-dark shadow-sm">
                <h3 className="text-xl md:text-2xl font-serif leading-relaxed mb-8">
                  {testQuestions[currentQuestionIndex].text}
                </h3>

                <div className="space-y-4">
                  {testQuestions[currentQuestionIndex].options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAnswerSelect(idx)}
                      className={`w-full p-4 text-left rounded-2xl border-2 transition-all flex items-center justify-between group ${
                        selectedAnswers[currentQuestionIndex] === idx
                          ? 'border-brand-gold bg-item-dark shadow-md ring-1 ring-brand-gold'
                          : 'border-border-dark hover:border-brand-gold bg-item-dark/50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${
                          selectedAnswers[currentQuestionIndex] === idx
                            ? 'bg-brand-gold text-bg-dark'
                            : 'bg-item-dark text-text-secondary group-hover:bg-border-dark'
                        }`}>
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="font-medium text-[15px]">{option}</span>
                      </div>
                      {selectedAnswers[currentQuestionIndex] === idx && (
                        <CheckCircle2 className="w-5 h-5 text-brand-gold" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <button
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                  className="px-6 py-3 rounded-2xl font-bold border-2 border-border-dark text-text-secondary hover:bg-item-dark disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  Previous
                </button>
                
                {currentQuestionIndex === testQuestions.length - 1 ? (
                  <button
                    onClick={submitTest}
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-brand-gold text-bg-dark rounded-2xl font-bold shadow-lg shadow-brand-gold/20 hover:bg-brand-gold/90 transition-all"
                  >
                    {isSubmitting ? 'Evaluating...' : 'Finish Test'}
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                    className="px-8 py-3 bg-brand-gold text-bg-dark rounded-2xl font-bold shadow-lg shadow-brand-gold/20 hover:bg-brand-gold/90 transition-all flex items-center gap-2"
                  >
                    Next Question <ChevronRight className="w-5 h-5" />
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* Results View */}
          {currentView === 'results' && testResult && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
              id="results-view"
            >
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold text-brand-gold">Your Performance Report</h2>
                <div className="flex items-center justify-center gap-4">
                  <div className="w-32 h-32 rounded-full border-8 border-item-dark flex items-center justify-center relative">
                    <span className="text-4xl font-black text-brand-gold">
                      {Math.round((testResult.score / testResult.total) * 100)}%
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="text-text-secondary font-semibold uppercase tracking-wider text-xs">Final Score</p>
                    <p className="text-3xl font-black">{testResult.score} <span className="text-text-secondary/50 font-normal">/ {testResult.total}</span></p>
                  </div>
                </div>
              </div>

              {/* Subject Wise breakdown */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['Physics', 'Chemistry', 'Biology', 'Mathematics'].map(subj => {
                   const relevantAnswers = testResult.answers.filter((a: any) => a.subject === subj);
                   if (relevantAnswers.length === 0) return null;
                   const correctCount = relevantAnswers.filter(a => a.isCorrect).length;
                   return (
                    <div key={subj} className="bg-card-dark p-4 rounded-2xl border border-border-dark text-center">
                      <p className="text-xs font-bold text-brand-gold/60 uppercase mb-1">{subj}</p>
                      <p className="text-xl font-bold">{correctCount}/{relevantAnswers.length}</p>
                    </div>
                   );
                })}
              </div>

              {/* AI Feedback Section */}
              <div className="bg-item-dark p-8 rounded-3xl border border-border-dark relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                  <BrainCircuit className="w-24 h-24 text-brand-gold" />
                </div>
                <div className="relative z-10 flex items-center gap-4 mb-6">
                  <div className="bg-brand-gold p-2 rounded-lg text-bg-dark">
                    <BrainCircuit className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-brand-gold uppercase tracking-wider">AI Performance Insight</h3>
                </div>
                
                {aiFeedback ? (
                  <div className="prose prose-invert max-w-none text-text-primary/90 leading-relaxed whitespace-pre-wrap font-sans text-[15px]">
                    {aiFeedback}
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 py-12">
                    <div className="w-8 h-8 border-4 border-brand-gold border-t-transparent rounded-full animate-spin" />
                    <p className="text-brand-gold font-bold">Generating deep insights...</p>
                  </div>
                )}
              </div>

              {/* Question Review */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold flex items-center gap-2 text-text-secondary">
                  <AlertCircle className="w-5 h-5" />
                  Review Questions
                </h3>
                {testQuestions.map((q, idx) => {
                  const result = testResult.answers.find(a => a.questionId === q.id);
                  return (
                    <div key={q.id} className={`p-6 rounded-2xl border ${result?.isCorrect ? 'border-green-900/50 bg-green-900/10' : 'border-red-900/50 bg-red-900/10'}`}>
                      <div className="flex items-start justify-between mb-4">
                        <span className="text-sm font-bold opacity-50 uppercase tracking-widest text-brand-gold">{q.subject}</span>
                        {result?.isCorrect ? (
                          <span className="bg-green-900 text-green-400 text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Correct
                          </span>
                        ) : (
                          <span className="bg-red-900 text-red-400 text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1">
                            <XCircle className="w-3 h-3" /> Incorrect
                          </span>
                        )}
                      </div>
                      <p className="font-semibold mb-4 text-lg">{q.text}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div className="p-3 bg-bg-dark/50 rounded-xl border border-border-dark">
                          <p className="text-xs font-bold text-text-secondary uppercase mb-1">Your Answer</p>
                          <p className={result?.isCorrect ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                            {result?.selectedOption !== null ? q.options[result.selectedOption] : 'No answer'}
                          </p>
                        </div>
                        {!result?.isCorrect && (
                          <div className="p-3 bg-bg-dark/50 rounded-xl border border-border-dark">
                            <p className="text-xs font-bold text-text-secondary uppercase mb-1">Correct Answer</p>
                            <p className="text-green-400 font-bold">{q.options[q.correctAnswer]}</p>
                          </div>
                        )}
                      </div>
                      <div className="mt-4 pt-4 border-t border-border-dark text-sm italic text-text-secondary/80">
                        {q.explanation}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-center pt-8">
                <button 
                  onClick={() => setCurrentView('dashboard')}
                  className="bg-brand-gold text-bg-dark px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-brand-gold/90 transition shadow-lg shadow-brand-gold/20"
                >
                  <RefreshCcw className="w-5 h-5" /> Retake Test
                </button>
              </div>
            </motion.div>
          )}

          {/* Study Assistant View */}
          {currentView === 'study' && (
            <motion.div
              key="study"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-[calc(100vh-160px)] flex flex-col"
              id="study-assistant-view"
            >
              <div className="flex-1 overflow-y-auto space-y-6 pb-6 scroll-smooth pr-4 scrollbar-hide">
                {chatHistory.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                    <div className="bg-item-dark p-6 rounded-full border border-border-dark">
                      <BrainCircuit className="w-12 h-12 text-brand-gold animate-pulse" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold mb-2 font-serif">How can I help you study?</h2>
                      <p className="text-text-secondary">Biology, Chemistry, Maths, or Physics. Ask me anything.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-lg">
                      {[
                        "Explain mitochondrial function",
                        "Show me the quadratic formula",
                        "What are Newton's Laws?",
                        "Properties of SN2 reactions"
                      ].map(q => (
                        <button 
                          key={q}
                          onClick={() => { setUserInput(q); }}
                          className="p-3 bg-card-dark border border-border-dark rounded-xl text-sm font-medium hover:border-brand-gold hover:bg-item-dark transition text-left text-text-secondary"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {chatHistory.map((msg, i) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={i} 
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] p-4 rounded-3xl ${
                      msg.role === 'user' 
                        ? 'bg-brand-gold text-bg-dark rounded-br-none shadow-lg' 
                        : 'bg-card-dark border border-border-dark rounded-bl-none shadow-sm'
                    }`}>
                      {msg.image && (
                        <div className="mb-3 rounded-2xl overflow-hidden border border-border-dark/20">
                          <img src={msg.image} alt="Study Context" className="w-full h-auto object-cover max-h-[300px]" referrerPolicy="no-referrer" />
                        </div>
                      )}
                      <div className="whitespace-pre-wrap leading-relaxed text-[15px]">
                        {msg.content}
                      </div>
                    </div>
                  </motion.div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-card-dark border border-border-dark p-4 rounded-3xl rounded-bl-none shadow-sm flex gap-1">
                      <span className="w-1.5 h-1.5 bg-brand-gold rounded-full animate-bounce" />
                      <span className="w-1.5 h-1.5 bg-brand-gold rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-1.5 h-1.5 bg-brand-gold rounded-full animate-bounce [animation-delay:-0.3s]" />
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-border-dark flex flex-col gap-3">
                <AnimatePresence>
                  {pendingImage && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="relative w-20 h-20 rounded-xl overflow-hidden border border-brand-gold"
                    >
                      <img src={pendingImage} alt="Pending upload" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      <button 
                        onClick={clearPendingImage}
                        className="absolute top-1 right-1 bg-red-500 text-white p-0.5 rounded-full shadow-md"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <div className="relative flex items-center gap-2">
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 bg-card-dark border border-border-dark text-brand-gold rounded-2xl hover:bg-item-dark transition flex items-center justify-center shrink-0"
                    title="Upload diagram or note"
                  >
                    <Upload className="w-5 h-5" />
                  </button>
                  
                  <div className="relative flex-1">
                    <input 
                      type="text" 
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Ask or describe a visualization..."
                      className="w-full bg-card-dark border border-border-dark rounded-2xl py-4 pl-6 pr-14 focus:outline-none focus:ring-2 focus:ring-brand-gold shadow-sm transition-all text-text-primary"
                    />
                    <button 
                      onClick={handleSendMessage}
                      disabled={(!userInput.trim() && !pendingImage) || isTyping}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-brand-gold text-bg-dark rounded-xl hover:bg-brand-gold/90 disabled:opacity-50 transition-all shadow-md"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>

                  <button 
                    onClick={handleVisualize}
                    disabled={!userInput.trim() || isTyping}
                    className="p-3 bg-item-dark border border-border-dark text-brand-gold rounded-2xl hover:border-brand-gold/50 transition flex items-center justify-center gap-2 font-bold shrink-0"
                    title="Brainstorm a visualization"
                  >
                    <Sparkles className="w-5 h-5" />
                    <span className="hidden md:inline text-xs">Visualize</span>
                  </button>
                </div>
                <p className="text-[10px] text-text-secondary text-center mt-1 uppercase tracking-widest font-bold">
                  Visual Learning Active • Powered by Gemini Flash & Image AI
                </p>
              </div>
            </motion.div>
          )}
          {/* Visual Lab View */}
          {currentView === 'lab' && (
            <motion.div
              key="lab"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100]"
            >
              <VisualLab onBack={() => setCurrentView('dashboard')} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

