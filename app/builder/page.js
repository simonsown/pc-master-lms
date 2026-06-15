'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { supabase } from '@/lib/supabase';
import { startBuilderSession, endBuilderSession } from '@/lib/learning-actions';
import dynamic from 'next/dynamic';
const HandTracker = dynamic(
  () => import('../../components/HandTracker'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center gap-2 text-sm text-[#5a5d72]">
        <div className="w-4 h-4 border-2 border-[#00d4aa] border-t-transparent rounded-full animate-spin" />
        Đang tải Hand Tracking...
      </div>
    )
  }
);
import GameEngine from '../../components/GameEngine';
import MultiplayerEngine from '../../components/MultiplayerEngine';
import MainMenu from '../../components/MainMenu';
import ComponentInfo from '../../components/ComponentInfo';
import PartPickerSidebar from '../../components/PartPickerSidebar';
import ComponentPreview from '../../components/ComponentPreview';
import BurgerMenu from '../../components/BurgerMenu';
import QuizModal from '../../components/QuizModal';
import WebcamCursor from '../../components/WebcamCursor';
import LearningMode from '../../components/LearningMode';
import Marketplace from '../../components/Marketplace';
import LectureCourse from '../../components/LectureCourse';
import VirtualAssistant from '../../components/VirtualAssistant';
import WindowsSimulator from '../../components/WindowsSimulator';
import LoadingScreen from '../../components/LoadingScreen';
import ExamsList from '../../components/ExamsList';
import LoginModal from '../../components/auth/LoginModal';
import StudentDashboardContent from '../../components/StudentDashboardContent';
import { GURU_MESSAGES } from '../../utils/i18nData';
import { useGuru } from '@/lib/guru-state';
import { withTracking } from '@/lib/tracking';
import BuilderLab from '@/components/builder/BuilderLab';
import CollaborationStatus from '@/components/builder/CollaborationStatus';
import VoiceController from '@/components/VoiceController';

// Hoist camera state outside component or use persistent Context to ensure "only turn on once" stays on even if rerendered
let globalCameraState = false;

function Home(props) {
  const [landmarks, setLandmarks] = useState([]);
  const [hoveredComponent, setHoveredComponent] = useState(null);
  const [lang, setLang] = useState('vn'); // 'en' or 'vn'
  const guru = useGuru();
  const [lastPlaced, setLastPlaced] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizParams, setQuizParams] = useState(null); // { topic, level, onSuccess }
  const [appMode, setAppMode] = useState('menu'); // 'menu', 'assembly', 'learning', 'course', 'market', 'multiplayer', 'mission_assembly', 'exams', 'challenge'
  const [appView, setAppView] = useState('menu'); // 'menu' or 'game'
  const [missionData, setMissionData] = useState(null);
  const [webcamMouseEnabled, setWebcamMouseEnabled] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(globalCameraState);
  const [trackingSensitivity, setTrackingSensitivity] = useState(1.0);
  const [placedItemsList, setPlacedItemsList] = useState([]);
  const [imageMode, setImageMode] = useState(false);
  const [lastVoiceResult, setLastVoiceResult] = useState('');
  const [showLoading, setShowLoading] = useState(true);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [showWindowsSim, setShowWindowsSim] = useState(false);
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      try { return localStorage.getItem('theme') || 'dark' } catch(e) {}
    }
    return 'dark'
  });

  const [isDemo, setIsDemo] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginRedirectTo, setLoginRedirectTo] = useState(null);
  const [showStudentDashboard, setShowStudentDashboard] = useState(false);
  const [userName, setUserName] = useState('');
  const [studentBudget, setStudentBudget] = useState(() => {
    if (typeof window !== 'undefined') {
      try { return parseInt(localStorage.getItem('studentBudget')) || 5000000 } catch(e) {}
    }
    return 5000000;
  });

  const gameEngineRef = useRef(null);

  const handleQuizScore = useCallback((score) => {
    const earned = score * 100000;
    setStudentBudget(prev => {
      const newBudget = prev + earned;
      try { localStorage.setItem('studentBudget', String(newBudget)) } catch(e) {}
      return newBudget;
    });
  }, []);

  const handlePartSelect = useCallback((type, modelId) => {
    if (gameEngineRef.current && gameEngineRef.current.spawnComponent) {
      const count = type === 'RAM' ? 2 : 1;
      gameEngineRef.current.spawnComponent(type, count, modelId);
    }
  }, []);

  const handleVoiceCommand = useCallback((action, params) => {
    if (action === 'SPAWN' && params?.type) {
      const ref = gameEngineRef.current;
      if (!ref) {
        setLastVoiceResult('❌ GameEngine chưa sẵn sàng');
        return;
      }
      const ok = ref.placeComponent?.(params.type);
      if (ok) {
        setLastVoiceResult(`✅ placeComponent(${params.type}) thành công`);
        setPlacedItemsList(prev => [...prev, params.type]);
      } else {
        setLastVoiceResult(`⚠️ placeComponent(${params.type}) thất bại → spawn staging`);
        if (ref.spawnComponent) {
          ref.spawnComponent(params.type, params.type === 'RAM' ? 2 : 1);
        }
      }
    } else if (action === 'REMOVE' && params?.type) {
      setLastVoiceResult(`🗑️ REMOVE ${params.type}`);
      setPlacedItemsList(prev => {
        const idx = prev.indexOf(params.type);
        if (idx === -1) return prev;
        const copy = [...prev];
        copy.splice(idx, 1);
        return copy;
      });
    } else if (action === 'RESET') {
      setLastVoiceResult('🔄 RESET');
      setPlacedItemsList([]);
    } else if (action === 'CHECK_COMPATIBILITY') {
      const totalTDP = { CPU: 125, GPU: 300, RAM: 10, SSD: 5, COOLER: 5, PSU: 0 };
      const psuItems = placedItemsList.filter(t => t === 'PSU');
      if (psuItems.length === 0) {
        guru.setMessage(lang === 'vn' ? 'Chưa có nguồn! Hãy lắp PSU trước.' : 'No PSU installed!');
        return;
      }
      const tdp = placedItemsList.reduce((sum, t) => sum + (totalTDP[t] || 0), 0);
      if (tdp > 500) {
        guru.setMessage(lang === 'vn' ? `Cảnh báo: TDP ${tdp}W có thể quá tải!` : `Warning: TDP ${tdp}W may exceed limit!`);
      } else {
        guru.setMessage(lang === 'vn' ? `TDP: ${tdp}W. Hệ thống tương thích!` : `TDP: ${tdp}W. System is compatible!`);
      }
    } else if (action === 'BOOT_PC') {
      setShowWindowsSim(true);
    }
  }, [placedItemsList, lang, guru]);

  const placedCounts = {};
  placedItemsList.forEach(item => {
    placedCounts[item] = (placedCounts[item] || 0) + 1;
  });

  useEffect(() => {
    let currentSessionId = null;

    async function initSession() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
          if (profile?.full_name) setUserName(profile.full_name);
        }
        const id = await startBuilderSession();
        if (id) {
          setSessionId(id);
          currentSessionId = id;
        }
      } catch (err) {
        console.error("Failed to start builder session:", err);
      }
    }
    initSession();

    return () => {
      if (currentSessionId) {
        endBuilderSession(currentSessionId, {
          components_used: [],
          tdp_calculated: 0,
          compatibility_score: 100
        });
      }
    };
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme === 'editorial-light' ? 'light' : theme);
    try { localStorage.setItem('theme', theme === 'editorial-light' ? 'light' : theme) } catch(e) {}
  }, [theme]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('demo') === 'true') {
        setIsDemo(true);
      }
      if (urlParams.get('requireAuth') === 'true') {
        setShowLoginModal(true);
        setLoginRedirectTo(urlParams.get('redirect') || null);
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, []);

  useEffect(() => {
    setPlacedItemsList([]);
    setLastPlaced(null);
  }, [appMode, appView]);

  const toggleLang = useCallback(() => {
    setLang(prev => {
      const newLang = prev === 'en' ? 'vn' : 'en';
      guru.setMessage(GURU_MESSAGES[newLang].welcome);
      return newLang;
    });
  }, []);

  // Update appView based on appMode changes
  useEffect(() => {
    if (appMode === 'menu') {
        setAppView('menu');
    } else {
        setAppView('game');
    }
  }, [appMode]);

  useEffect(() => {
    if (!showLoading && typeof window !== 'undefined' && window.driver && window.driver.js && window.driver.js.driver) {
      const isDone = localStorage.getItem('onboardingDone_v2');
      if (!isDone) {
        const driver = window.driver.js.driver;
        const driverObj = driver({
          showProgress: true,
          steps: [
            { element: '.sidebar-container', popover: { title: 'Menu Điều Khiển', description: 'Đầy đủ các chức năng khám phá, từ bài giảng đến 2 người chơi.', side: 'right', align: 'start' }},
            { element: '.mode-card', popover: { title: 'Chế độ Bài Giảng', description: 'Học các lý thuyết cơ bản trước khi lắp ráp nhé.', side: 'bottom', align: 'start' }},
            { element: '.toggle-switch', popover: { title: 'Theo dõi tay (Webcam)', description: 'Bật tính năng này để dùng tay "cầm nắm" linh kiện ảo!', side: 'right', align: 'start' }},
          ],
          onDestroyStarted: () => {
             localStorage.setItem('onboardingDone_v2', 'true');
             driverObj.destroy();
          }
        });
        driverObj.drive();
      }
    }
  }, [showLoading]);

  const handleHover = useCallback((componentType) => {
    setHoveredComponent(componentType);
  }, []);

  const handleGameEvent = useCallback((event, type) => {
    const messages = GURU_MESSAGES[lang];
    if (event === 'grabbed') {
      guru.setSilentMessage(messages.grabbed(type));
    } else if (event === 'placed') {
      setLastPlaced({ type, id: Date.now() });
      setPlacedItemsList(prev => [...prev, type]);
      guru.setSilentMessage(messages.placed(type));
    } else if (event === 'COMPLETE') {
      const saveSession = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('assembly_sessions').insert({
            user_id: user.id,
            mode: appMode,
            completed: true,
            time_taken: 0
          });
        }
      };
      saveSession();

      if (appMode === 'mission_assembly' && missionData) {
        setTimeout(() => setShowWindowsSim(true), 500);
      } else if (appMode === 'assembly') {
        setShowWindowsSim(true);
      } else {
        guru.setMessage(lang === 'en' ? 'SYSTEM COMPLETE!' : 'HỆ THỐNG HOÀN THIỆN!');
      }
    } else if (event.startsWith('grabbed_')) {
      const player = event.split('_')[1].toUpperCase();
      guru.setSilentMessage(`${player}: ${messages.grabbed(type)}`);
    } else if (event.startsWith('placed_')) {
      const player = event.split('_')[1].toUpperCase();
      guru.setSilentMessage(`${player}: ${messages.placed(type)}`);
    } else if (event.startsWith('win_')) {
      const player = event.split('_')[1].toUpperCase();
      guru.setMessage(lang === 'en' ? `${player} WINS THE MATCH!` : `${player} ĐÃ GIÀNH CHIẾN THẮNG!`);
    }
  }, [lang, appMode, missionData]);

  const getModeTitle = () => {
    switch(appMode) {
        case 'assembly': return lang === 'en' ? 'Free Practice' : 'Luyện Tập Tự Do';
        case 'learning': return lang === 'en' ? 'Practice Mode' : 'Luyện Tập';
        case 'course': return lang === 'en' ? 'Lecture Course' : 'Bài Giảng';
        case 'market': return lang === 'en' ? 'Marketplace' : 'Chợ Máy Tính';
        case 'mission_assembly': return lang === 'en' ? `Lab: ${missionData?.missionId}` : `Phòng Lab: ${missionData?.missionId}`;
        case 'multiplayer': return lang === 'en' ? '2-Player Versus' : '2 Người Chơi';
        case 'exams': return lang === 'en' ? 'Exams' : 'Kỳ Thi';
        case 'challenge': return lang === 'en' ? 'Daily Challenge' : 'Thử Thách';
        case 'components': return lang === 'en' ? 'Component Library' : 'Tủ Linh Kiện';
        default: return 'PC Master Builder';
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)', position: 'relative' }}>
      {showLoading && <LoadingScreen onComplete={() => setShowLoading(false)} />}
      
      {isDemo && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
          background: 'linear-gradient(90deg, #6366f1, #00d2a0)',
          color: 'white', padding: '8px 16px', textAlign: 'center',
          fontSize: '14px', fontWeight: 600, display: 'flex', 
          alignItems: 'center', justifyContent: 'center', gap: '12px'
        }}>
          <span>Bạn đang ở Chế độ Demo (Khách). Tiến độ học tập sẽ không được lưu lại.</span>
          <Link href="/register" style={{ 
            background: 'white', color: '#6366f1', padding: '2px 12px', 
            borderRadius: '4px', textDecoration: 'none', fontSize: '12px'
          }}>
            Đăng ký ngay
          </Link>
        </div>
      )}
      <BurgerMenu
        lang={lang}
        toggleLang={toggleLang}
        onStartQuiz={() => setShowQuiz(true)}
        appMode={appMode}
        setAppMode={setAppMode}
        webcamMouseEnabled={webcamMouseEnabled}
        setWebcamMouseEnabled={(val) => {
          setWebcamMouseEnabled(val);
          if (val) {
            globalCameraState = true;
            setIsCameraActive(true);
          }
        }}
        trackingSensitivity={trackingSensitivity}
        setTrackingSensitivity={setTrackingSensitivity}
        onToggleAI={() => setIsAIOpen(prev => !prev)}
        isAIOpen={isAIOpen}
        theme={theme}
        setTheme={setTheme}
        userName={userName}
        onShowDashboard={() => setShowStudentDashboard(true)}
      />



      <main className="main-content">
        {appMode !== 'multiplayer' && <WebcamCursor landmarks={landmarks} enabled={webcamMouseEnabled} trackingSensitivity={trackingSensitivity} />}

        {showQuiz && (
            <QuizModal
            lang={lang}
            topic={quizParams?.topic}
            level={quizParams?.level}
            onSuccess={quizParams?.onSuccess}
            onScore={handleQuizScore}
            onClose={() => {
                setShowQuiz(false);
                setQuizParams(null);
            }}
            />
        )}

        {/* Virtual Assistant — visible on all modes except menu */}
        {appView !== 'menu' && (
            <VirtualAssistant
                lang={lang}
                appMode={appMode}
                cartItems={missionData?.purchasedItems ?? []}
                remainingBudget={missionData?.remainingBudget}
                missionTitle={missionData?.missionId}
                isOpen={isAIOpen}
                setIsOpen={setIsAIOpen}
            />
        )}

        {appView === 'menu' ? (
            <MainMenu
                lang={lang}
                onStart={(mode) => setAppMode(mode)}
                onOpenLogin={() => setShowLoginModal(true)}
            />
        ) : (
            <div style={{
                display: 'flex', flexDirection: 'column', width: '100%',
                height: 'calc(100vh - 60px)',
                padding: ['course','market'].includes(appMode) ? '0' : '24px',
                overflow: 'hidden'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '12px 24px', background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)', borderRadius: '12px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '14px', cursor: 'pointer' }} onClick={() => setAppMode('menu')}>
                            {lang === 'en' ? 'Home' : 'Trang chủ'}
                        </span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>/</span>
                        <span style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: 600 }}>
                            {getModeTitle()}
                        </span>
                    </div>

                    <CollaborationStatus />

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {/* Hand Tracking Status Badge */}
                        <div style={{ 
                            display: 'flex', alignItems: 'center', gap: '8px', 
                            padding: '4px 12px', borderRadius: '100px', 
                            background: webcamMouseEnabled ? 'rgba(16, 185, 129, 0.1)' : 'rgba(71, 85, 105, 0.1)',
                            border: `1px solid ${webcamMouseEnabled ? 'rgba(16, 185, 129, 0.2)' : 'rgba(71, 85, 105, 0.2)'}`
                        }}>
                            <div style={{ 
                                width: '8px', height: '8px', borderRadius: '50%', 
                                background: webcamMouseEnabled ? 'var(--success)' : 'var(--text-muted)',
                                boxShadow: webcamMouseEnabled ? '0 0 8px var(--success)' : 'none',
                                animation: webcamMouseEnabled ? 'blink 2s infinite' : 'none'
                            }}></div>
                            <span style={{ fontSize: '12px', fontWeight: 600, color: webcamMouseEnabled ? 'var(--success)' : 'var(--text-muted)' }}>
                                Hand Tracking: {webcamMouseEnabled ? 'ON' : 'OFF'}
                            </span>
                        </div>
                        
                        <button
                            onClick={() => setAppMode('menu')}
                            style={{
                                padding: '6px 16px', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
                                borderRadius: '6px', color: 'var(--text-primary)', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.background = 'var(--bg-hover)'; }}
                            onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.background = 'var(--bg-elevated)'; }}
                        >
                            {lang === 'en' ? 'Back' : 'Thoát'}
                        </button>
                    </div>
                </div>

                {/* Camera Feed Area — Fixed global (except in learning mode where it's integrated) */}
                {appMode !== 'menu' && appMode !== 'course' && appMode !== 'market' && appMode !== 'learning' && (
                    <div style={{
                        ...(appMode === 'multiplayer' ? {
                            position: 'absolute', top: '80px', left: '50%', transform: 'translateX(-50%)', width: '280px', zIndex: 1001,
                        } : {
                            position: 'fixed', bottom: '2rem', right: '2rem', width: '360px',
                        }),
                        zIndex: 1000, pointerEvents: 'none'
                    }}>
                        <div className="glass-panel" style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', pointerEvents: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.3)', background: 'rgba(10, 20, 40, 0.8)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <h3 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    📷 Camera
                                    {appMode === 'multiplayer' && <span style={{ fontSize: '9px', padding: '2px 6px', borderRadius: '4px', background: '#fbbf24', color: '#000', fontWeight: 700 }}>2 NGƯỜI</span>}
                                </h3>
                                <button
                                    onClick={() => {
                                        const nextCameraState = !isCameraActive;
                                        globalCameraState = nextCameraState;
                                        setIsCameraActive(nextCameraState);
                                        setWebcamMouseEnabled(nextCameraState);
                                        if (!nextCameraState) setLandmarks([]);
                                    }}
                                    style={{
                                        background: isCameraActive ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                        color: isCameraActive ? '#ef4444' : 'var(--success)',
                                        border: `1px solid ${isCameraActive ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
                                        padding: '2px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 600,
                                    }}
                                >
                                    {isCameraActive ? (lang === 'en' ? 'Off' : 'Tắt') : (lang === 'en' ? 'On' : 'Bật')}
                                </button>
                            </div>
                            <div style={{ width: '100%', overflow: 'hidden', borderRadius: '4px', background: '#020617', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {isCameraActive ? (
                                    <div style={{ width: '100%', height: appMode === 'multiplayer' ? '160px' : '220px' }}>
                                        <HandTracker onLandmarks={setLandmarks} />
                                    </div>
                                ) : (
                                    <p style={{ color: 'var(--text-muted)', fontSize: '11px', textAlign: 'center', padding: '1rem', margin: 0 }}>
                                        {lang === 'en' ? 'OFF' : 'TẮT'}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Main View Port */}
                <div style={{ display: 'flex', flexDirection: 'column', width: '100%', flex: 1, alignItems: 'center', justifyContent: ['course','market'].includes(appMode) ? 'flex-start' : 'center', overflow: 'auto' }}>
                    <div style={{ width: '100%', maxWidth: ['course','market'].includes(appMode) ? '100%' : '1400px', position: 'relative', height: ['course','market'].includes(appMode) ? '100%' : 'auto', padding: ['course','market'].includes(appMode) ? '0' : '0' }}>
                        {appMode === 'assembly' ? (
                            <div style={{ display: 'flex', gap: '16px', width: '100%' }}>
                                <PartPickerSidebar
                                    lang={lang}
                                    onSelect={handlePartSelect}
                                    placedCounts={placedCounts}
                                />
                                <div style={{ flex: 1, position: 'relative' }}>
                                <h2 style={{ color: 'var(--success)', marginTop: 0 }}>
                                    {lang === 'en' ? 'Free Practice' : 'Luyện tập tự do'}
                                </h2>
                                <GameEngine
                                    ref={gameEngineRef}
                                    landmarks={landmarks}
                                    onHover={handleHover}
                                    onGameEvent={handleGameEvent}
                                    trackingSensitivity={trackingSensitivity}
                                    imageMode={imageMode}
                                />
                                {/* Checklist + Debug */}
                                <div className="glass-panel" style={{
                                    position: 'absolute', top: '50px', right: '2%', padding: '1rem',
                                    minWidth: 'min(200px, 25vw)', pointerEvents: 'none', zIndex: 10
                                }}>
                                    <h3 style={{ margin: '0 0 10px 0', fontSize: '13px', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                        {lang === 'en' ? 'Checklist' : 'Nhiệm vụ'}
                                    </h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                                        {[
                                            { type: 'CPU', target: 1 }, { type: 'COOLER', target: 1 },
                                            { type: 'RAM', target: 2 }, { type: 'GPU', target: 1 },
                                            { type: 'SSD', target: 1 }, { type: 'PSU', target: 1 }
                                        ].map(comp => {
                                            const count = placedItemsList.filter(item => item === comp.type).length;
                                            const isDone = count >= comp.target;
                                            return (
                                                <div key={comp.type} style={{ color: isDone ? 'var(--success)' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span>{isDone ? '☑' : '☐'}</span>
                                                    <span>{comp.type} ({Math.min(count, comp.target)}/{comp.target})</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '10px 0' }} />
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
                                        <div style={{ pointerEvents: 'auto', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                                             onClick={() => setImageMode(!imageMode)}>
                                            <span style={{ opacity: imageMode ? 1 : 0.4 }}>📷</span>
                                            <span>{imageMode ? (lang === 'en' ? 'Image Mode' : 'Ảnh thật') : (lang === 'en' ? 'Image Mode' : 'Ảnh vẽ')}</span>
                                        </div>
                                        <div style={{ pointerEvents: 'auto', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                            <button onClick={() => {
                                                const ok = gameEngineRef.current?.placeComponent?.('CPU');
                                                setLastVoiceResult(ok ? '✅ Test CPU OK' : '❌ Test CPU fail');
                                            }} style={{ fontSize: '10px', padding: '2px 6px', cursor: 'pointer', background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: '4px', color: 'var(--text-primary)' }}>
                                                Test CPU
                                            </button>
                                            <button onClick={() => {
                                                const ok = gameEngineRef.current?.placeComponent?.('SSD');
                                                setLastVoiceResult(ok ? '✅ Test SSD OK' : '❌ Test SSD fail');
                                            }} style={{ fontSize: '10px', padding: '2px 6px', cursor: 'pointer', background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: '4px', color: 'var(--text-primary)' }}>
                                                Test SSD
                                            </button>
                                        </div>
                                    </div>
                                    {lastVoiceResult && (
                                        <div style={{ marginTop: '6px', padding: '4px 8px', borderRadius: '4px', background: 'rgba(0,0,0,0.3)', fontSize: '10px', color: '#ff0', fontFamily: 'monospace', wordBreak: 'break-word' }}>
                                            {lastVoiceResult}
                                        </div>
                                    )}
                                </div>
                            </div>
                            </div>
                        ) : appMode === 'market' ? (
                            <Marketplace
                                lang={lang}
                                budget={studentBudget}
                                onCheckout={(data) => {
                                    setMissionData(data);
                                    setStudentBudget(data.remainingBudget);
                                    try { localStorage.setItem('studentBudget', String(data.remainingBudget)) } catch(e) {}
                                    setAppMode('mission_assembly');
                                }}
                                onCancel={() => setAppMode('menu')}
                            />
                        ) : appMode === 'mission_assembly' ? (
                            <div style={{ width: '100%', position: 'relative' }}>
                                <h2 style={{ color: 'var(--brand-primary)', marginTop: 0 }}>
                                    {lang === 'en' ? `Lab: ${missionData?.missionId || missionData?.scenarioName}` : `Phòng Lab: ${missionData?.missionId || missionData?.scenarioName}`}
                                </h2>
                                <GameEngine
                                    ref={gameEngineRef}
                                    landmarks={landmarks}
                                    onHover={handleHover}
                                    onGameEvent={handleGameEvent}
                                    trackingSensitivity={trackingSensitivity}
                                    purchasedItems={missionData?.purchasedItems}
                                    imageMode={imageMode}
                                />
                            </div>
                        ) : appMode === 'course' ? (
                            <LectureCourse lang={lang} onBack={() => setAppMode('menu')} />
                        ) : appMode === 'learning' ? (
                            <LearningMode
                                lang={lang}
                                externalSelection={lastPlaced}
                                appMode={appMode}
                                landmarks={landmarks}
                                onHover={handleHover}
                                onGameEvent={handleGameEvent}
                                trackingSensitivity={trackingSensitivity}
                                isCameraActive={isCameraActive}
                                setIsCameraActive={(val) => {
                                    globalCameraState = val;
                                    setIsCameraActive(val);
                                    setWebcamMouseEnabled(val);
                                    if (!val) setLandmarks([]);
                                }}
                                onSetLandmarks={setLandmarks}
                                onTakeQuiz={(topic, level, onSuccess) => {
                                    setQuizParams({ topic, level, onSuccess });
                                    setShowQuiz(true);
                                }}
                            />
                        ) : appMode === 'multiplayer' ? (
                            <div style={{ width: '100%' }}>
                                <h2 style={{ color: 'var(--brand-primary)', textAlign: 'center', marginTop: 0 }}>
                                    {lang === 'en' ? '2-Player Versus Mode' : 'Chế độ 2 Người Chơi'}
                                </h2>
                                <MultiplayerEngine
                                    landmarks={landmarks}
                                    onGameEvent={handleGameEvent}
                                    lang={lang}
                                    trackingSensitivity={trackingSensitivity}
                                />
                            </div>
                        ) : appMode === 'exams' ? (
                            <ExamsList lang={lang} onBack={() => setAppMode('menu')} />
                        ) : appMode === 'components' ? (
                            <div style={{ width: '100%', padding: '24px' }}>
                                <h2 style={{ color: 'var(--brand-primary)', marginTop: 0, marginBottom: 16 }}>
                                    {lang === 'en' ? 'Component Library' : 'Tủ Linh Kiện'}
                                </h2>
                                <BuilderLab />
                            </div>
                        ) : appMode === 'challenge' ? (
                            <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
                                <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#1A2F4A', marginBottom: '16px' }}>Thử Thách Hằng Ngày</h2>
                                <p style={{ color: '#64748B', fontSize: '14px', marginBottom: '24px' }}>Hoàn thành thử thách để nhận điểm kinh nghiệm và huy hiệu.</p>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    {[
                                        { title: 'Lắp ráp nhanh', desc: 'Hoàn thành 1 bộ PC trong 5 phút', reward: '100 XP', color: '#D32F2F' },
                                        { title: 'Tiết kiệm', desc: 'Build dưới 15 triệu với hiệu năng cao', reward: '150 XP', color: '#0097A7' },
                                        { title: 'Tương thích hoàn hảo', desc: 'Lắp 5 bộ không lỗi tương thích', reward: '75 XP', color: '#F5A623' },
                                        { title: 'Cấu hình cân bằng', desc: 'CPU + GPU đồng cấp, không nghẽn cổ chai', reward: '200 XP', color: '#1A2F4A' },
                                    ].map((c, i) => (
                                        <div key={i} style={{ padding: '20px', borderRadius: '10px', border: '1px solid #E2E8F0', background: '#fff' }}>
                                            <div style={{ fontSize: '11px', fontWeight: 700, color: c.color, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>{c.title}</div>
                                            <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '12px', lineHeight: 1.5 }}>{c.desc}</p>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontSize: '12px', fontWeight: 700, color: c.color }}>+{c.reward}</span>
                                                <button onClick={() => { setAppMode('learning'); }}
                                                    style={{ padding: '6px 14px', borderRadius: '6px', border: 'none', background: c.color, color: '#fff', fontWeight: 600, fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit' }}>
                                                    Nhận thử thách
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : null}
                    </div>

                    {appMode === 'assembly' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '800px' }}>
                            <ComponentInfo type={hoveredComponent} lang={lang} />
                        </div>
                    )}
                </div>
            </div>
        )}

      </main>

      {showWindowsSim && (
        <WindowsSimulator
          cart={missionData?.purchasedItems || placedItemsList.map(type => ({ type, name: type }))}
          scenarioName={missionData?.scenarioName}
          onExit={() => { setShowWindowsSim(false); setAppMode('menu'); setPlacedItemsList([]); setMissionData(null); }}
        />
      )}

      {['assembly', 'mission_assembly'].includes(appMode) && (
        <VoiceController
          lang={lang}
          onCommand={handleVoiceCommand}
        />
      )}

      <LoginModal isOpen={showLoginModal} onClose={() => { setShowLoginModal(false); setLoginRedirectTo(null); }} redirectTo={loginRedirectTo} />

      {showStudentDashboard && (
        <StudentDashboardContent onClose={() => setShowStudentDashboard(false)} />
      )}
    </div>
  );
}

export default withTracking(Home);
