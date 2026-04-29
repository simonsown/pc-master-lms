'use client';

import { useState, useCallback, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { supabase } from '@/lib/supabase';
import HandTracker from '../../components/HandTracker';
import GameEngine from '../../components/GameEngine';
import MultiplayerEngine from '../../components/MultiplayerEngine';
import MainMenu from '../../components/MainMenu';
import ComponentInfo from '../../components/ComponentInfo';
import AIGuru from '../../components/AIGuru';
import BurgerMenu from '../../components/BurgerMenu';
import QuizModal from '../../components/QuizModal';
import WebcamCursor from '../../components/WebcamCursor';
import LearningMode from '../../components/LearningMode';
import Marketplace from '../../components/Marketplace';
import LectureCourse from '../../components/LectureCourse';
import VirtualAssistant from '../../components/VirtualAssistant';
import LoadingScreen from '../../components/LoadingScreen';
import { GURU_MESSAGES } from '../../utils/i18nData';

// Hoist camera state outside component or use persistent Context to ensure "only turn on once" stays on even if rerendered
let globalCameraState = false;

export default function Home() {
  const [landmarks, setLandmarks] = useState([]);
  const [hoveredComponent, setHoveredComponent] = useState(null);
  const [lang, setLang] = useState('vn'); // 'en' or 'vn'
  const [guruMessage, setGuruMessage] = useState(GURU_MESSAGES['en'].welcome);
  const [guruTrigger, setGuruTrigger] = useState(0);
  const [lastPlaced, setLastPlaced] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizParams, setQuizParams] = useState(null); // { topic, level, onSuccess }
  const [appMode, setAppMode] = useState('menu'); // 'menu', 'assembly', 'learning', 'course', 'market', 'multiplayer', 'mission_assembly'
  const [appView, setAppView] = useState('menu'); // 'menu' or 'game'
  const [missionData, setMissionData] = useState(null);
  const [webcamMouseEnabled, setWebcamMouseEnabled] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(globalCameraState);
  const [trackingSensitivity, setTrackingSensitivity] = useState(1.5);
  const [placedItemsList, setPlacedItemsList] = useState([]);
  const [showLoading, setShowLoading] = useState(true);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    setPlacedItemsList([]);
    setLastPlaced(null);
  }, [appMode, appView]);

  const toggleLang = useCallback(() => {
    setLang(prev => {
      const newLang = prev === 'en' ? 'vn' : 'en';
      setGuruMessage(GURU_MESSAGES[newLang].welcome);
      setGuruTrigger(t => t + 1);
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
    setGuruTrigger(prev => prev + 1);
    const messages = GURU_MESSAGES[lang];
    if (event === 'grabbed') {
      setGuruMessage(messages.grabbed(type));
    } else if (event === 'placed') {
      setLastPlaced({ type, id: Date.now() });
      setPlacedItemsList(prev => [...prev, type]);
      setGuruMessage(messages.placed(type));
    } else if (event === 'COMPLETE') {
      // Lưu vào Database
      const saveSession = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('assembly_sessions').insert({
            user_id: user.id,
            mode: appMode,
            completed: true,
            time_taken: 0 // Có thể nâng cấp đếm thời gian sau
          });
        }
      };
      saveSession();

      if (appMode === 'mission_assembly' && missionData) {
        let totalTDP = 0, psuWattage = 0;
        missionData.purchasedItems.forEach(item => {
          if (item.power) totalTDP += item.power;
          if (item.wattage) psuWattage += item.wattage;
        });

        let msg = lang === 'en' ? 'SYSTEM ASSEMBLED! ' : 'HỆ THỐNG ĐÃ LẮP XONG! ';

        if (psuWattage < totalTDP + 50) {
          msg += lang === 'en' ? 'But the PSU is too weak! System CRASHED 💥' : 'Nhưng nguồn quá yếu! Hệ thống CHÁY NỔ 💥';
        } else if (missionData?.targets?.minPower && totalTDP < missionData.targets.minPower) {
          msg += lang === 'en' ? 'FAILED: Not enough performance for this quest.' : 'KÉM: Chưa đạt sức mạnh tối thiểu của nhiệm vụ.';
        } else if (missionData?.remainingBudget < 0) {
          msg += lang === 'en' ? 'FAILED: Over budget!' : 'THẤT BẠI: Quá ngân sách!';
        } else {
          msg += lang === 'en' ? 'MISSION ACCOMPLISHED! Perfect build 🏆' : 'HOÀN THÀNH NHIỆM VỤ! Cấu hình hoàn hảo 🏆';
          confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        }
        setGuruMessage(msg);
      } else {
        setGuruMessage(lang === 'en' ? 'SYSTEM COMPLETE!' : 'HỆ THỐNG HOÀN THIỆN!');
      }
    } else if (event.startsWith('grabbed_')) {
      const player = event.split('_')[1].toUpperCase();
      setGuruMessage(`${player}: ${messages.grabbed(type)}`);
    } else if (event.startsWith('placed_')) {
      const player = event.split('_')[1].toUpperCase();
      setGuruMessage(`${player}: ${messages.placed(type)}`);
    } else if (event.startsWith('win_')) {
      const player = event.split('_')[1].toUpperCase();
      setGuruMessage(lang === 'en' ? `${player} WINS THE MATCH!` : `${player} ĐÃ GIÀNH CHIẾN THẮNG!`);
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
        default: return 'PC Master Builder';
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
      {showLoading && <LoadingScreen onComplete={() => setShowLoading(false)} />}
      <BurgerMenu
        lang={lang}
        toggleLang={toggleLang}
        onStartQuiz={() => setShowQuiz(true)}
        appMode={appMode}
        setAppMode={setAppMode}
        webcamMouseEnabled={webcamMouseEnabled}
        setWebcamMouseEnabled={setWebcamMouseEnabled}
        trackingSensitivity={trackingSensitivity}
        setTrackingSensitivity={setTrackingSensitivity}
        onToggleAI={() => setIsAIOpen(prev => !prev)}
        isAIOpen={isAIOpen}
        theme={theme}
        setTheme={setTheme}
      />



      <main className="main-content">
        <WebcamCursor landmarks={landmarks} enabled={webcamMouseEnabled} trackingSensitivity={trackingSensitivity} />

        {showQuiz && (
            <QuizModal
            lang={lang}
            topic={quizParams?.topic}
            level={quizParams?.level}
            onSuccess={quizParams?.onSuccess}
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
            />
        ) : (
            <div style={{
                display: 'flex', flexDirection: 'column', width: '100%',
                height: 'calc(100vh - 60px)',
                padding: ['course','market'].includes(appMode) ? '0' : '24px',
                overflow: ['course','market'].includes(appMode) ? 'hidden' : 'auto'
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
                            position: 'absolute', top: '100px', left: '50%', transform: 'translateX(-50%)', width: '200px',
                        } : {
                            position: 'fixed', bottom: '2rem', right: '2rem', width: '360px',
                        }),
                        zIndex: 1000, pointerEvents: 'none'
                    }}>
                        <div className="glass-panel" style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', pointerEvents: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.3)', background: 'rgba(10, 20, 40, 0.8)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <h3 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600 }}>{lang === 'en' ? 'Camera' : 'Camera'}</h3>
                                <button
                                    onClick={() => {
                                        const nextCameraState = !isCameraActive;
                                        globalCameraState = nextCameraState;
                                        setIsCameraActive(nextCameraState);
                                        if (!nextCameraState) setLandmarks([]);
                                    }}
                                    style={{
                                        background: isCameraActive ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                        color: isCameraActive ? 'var(--danger)' : 'var(--success)',
                                        border: `1px solid ${isCameraActive ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
                                        padding: '2px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 600,
                                    }}
                                >
                                    {isCameraActive ? (lang === 'en' ? 'Off' : 'Tắt') : (lang === 'en' ? 'On' : 'Bật')}
                                </button>
                            </div>
                            <div style={{ width: '100%', overflow: 'hidden', borderRadius: '4px', background: '#020617', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {isCameraActive ? (
                                    <div style={{ width: '100%', height: appMode === 'multiplayer' ? '120px' : '220px' }}>
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
                            <div style={{ width: '100%', position: 'relative' }}>
                                <h2 style={{ color: 'var(--success)', marginTop: 0 }}>
                                    {lang === 'en' ? 'Free Practice' : 'Luyện tập tự do'}
                                </h2>
                                <GameEngine
                                    landmarks={landmarks}
                                    onHover={handleHover}
                                    onGameEvent={handleGameEvent}
                                    trackingSensitivity={trackingSensitivity}
                                />
                                {/* Checklist */}
                                <div className="glass-panel" style={{
                                    position: 'absolute', top: '50px', right: '2%', padding: '1rem',
                                    minWidth: 'min(160px, 20vw)', pointerEvents: 'none', zIndex: 10
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
                                </div>
                            </div>
                        ) : appMode === 'market' ? (
                            <Marketplace
                                lang={lang}
                                onCheckout={(data) => {
                                    setMissionData(data);
                                    setAppMode('mission_assembly');
                                }}
                                onCancel={() => setAppMode('menu')}
                            />
                        ) : appMode === 'mission_assembly' ? (
                            <div style={{ width: '100%', position: 'relative' }}>
                                <h2 style={{ color: 'var(--brand-primary)', marginTop: 0 }}>
                                    {lang === 'en' ? `Lab: ${missionData?.missionId}` : `Phòng Lab: ${missionData?.missionId}`}
                                </h2>
                                <GameEngine
                                    landmarks={landmarks}
                                    onHover={handleHover}
                                    onGameEvent={handleGameEvent}
                                    trackingSensitivity={trackingSensitivity}
                                    purchasedItems={missionData?.purchasedItems}
                                />
                                <div className="glass-panel" style={{
                                    position: 'absolute', top: '50px', right: '2%', padding: '1rem',
                                    minWidth: 'min(160px, 20vw)', pointerEvents: 'none', zIndex: 10
                                }}>
                                    <h3 style={{ margin: '0 0 10px 0', fontSize: '13px', color: 'var(--text-primary)', textTransform: 'uppercase' }}>
                                        {lang === 'en' ? 'Purchased Inventory' : 'Khay linh kiện'}
                                    </h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                                        {missionData?.purchasedItems?.map((comp, idx) => (
                                            <div key={idx} style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span>☐</span>
                                                <span>{comp.type}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
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

        <AIGuru message={guruMessage} trigger={guruTrigger} lang={lang} />
      </main>
    </div>
  );
}
