import { useState, useEffect, useCallback } from 'react';

type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

const TIMER_CONFIGS = {
  focus: { duration: 25 * 60, label: 'Focus', color: '#C4553A' },
  shortBreak: { duration: 5 * 60, label: 'Short Break', color: '#5A8F7B' },
  longBreak: { duration: 15 * 60, label: 'Long Break', color: '#7B8FA5' },
};

function App() {
  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState(TIMER_CONFIGS.focus.duration);
  const [isRunning, setIsRunning] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);

  const currentConfig = TIMER_CONFIGS[mode];
  const progress = 1 - timeLeft / currentConfig.duration;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleModeChange = useCallback((newMode: TimerMode) => {
    setMode(newMode);
    setTimeLeft(TIMER_CONFIGS[newMode].duration);
    setIsRunning(false);
  }, []);

  const handleReset = useCallback(() => {
    setTimeLeft(currentConfig.duration);
    setIsRunning(false);
  }, [currentConfig.duration]);

  const handleToggle = useCallback(() => {
    setIsRunning((prev) => !prev);
  }, []);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          if (mode === 'focus') {
            setCompletedPomodoros((p) => p + 1);
            const nextMode = (completedPomodoros + 1) % 4 === 0 ? 'longBreak' : 'shortBreak';
            setTimeout(() => handleModeChange(nextMode), 500);
          } else {
            setTimeout(() => handleModeChange('focus'), 500);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, mode, completedPomodoros, handleModeChange]);

  // SVG circle parameters
  const size = 320;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div className="min-h-screen bg-[#F5F1EB] flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden">
      {/* Paper texture overlay */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Subtle decorative elements */}
      <div
        className="absolute top-10 right-10 w-32 h-32 md:w-48 md:h-48 rounded-full opacity-[0.03]"
        style={{ backgroundColor: currentConfig.color }}
      />
      <div
        className="absolute bottom-20 left-10 w-24 h-24 md:w-36 md:h-36 rounded-full opacity-[0.03]"
        style={{ backgroundColor: currentConfig.color }}
      />

      {/* Main content */}
      <main className="relative z-10 flex flex-col items-center max-w-lg w-full">
        {/* Header */}
        <header className="text-center mb-8 md:mb-12">
          <h1
            className="text-3xl md:text-4xl font-serif text-[#2D2A26] tracking-wide mb-2"
            style={{ fontFamily: 'Cormorant Garamond, serif' }}
          >
            Pomodoro
          </h1>
          <p className="text-sm text-[#6B6560] tracking-[0.2em] uppercase" style={{ fontFamily: 'Karla, sans-serif' }}>
            Focus Timer
          </p>
        </header>

        {/* Mode selector */}
        <nav className="flex gap-2 md:gap-4 mb-8 md:mb-12" style={{ fontFamily: 'Karla, sans-serif' }}>
          {(Object.keys(TIMER_CONFIGS) as TimerMode[]).map((m) => (
            <button
              key={m}
              onClick={() => handleModeChange(m)}
              className={`px-3 py-2 md:px-5 md:py-2.5 text-xs md:text-sm tracking-wide rounded-full transition-all duration-300 ${
                mode === m
                  ? 'text-[#F5F1EB] shadow-lg'
                  : 'text-[#6B6560] hover:text-[#2D2A26] bg-transparent'
              }`}
              style={{
                backgroundColor: mode === m ? TIMER_CONFIGS[m].color : 'transparent',
              }}
            >
              {TIMER_CONFIGS[m].label}
            </button>
          ))}
        </nav>

        {/* Timer display */}
        <div className="relative mb-8 md:mb-12">
          {/* Enso-style circle */}
          <svg
            width={size}
            height={size}
            className="transform -rotate-90 w-64 h-64 md:w-80 md:h-80"
            viewBox={`0 0 ${size} ${size}`}
          >
            {/* Background circle with organic imperfection */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#E5DFD6"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              style={{
                filter: 'url(#roughen)',
              }}
            />
            {/* Progress circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={currentConfig.color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-300 ease-out"
              style={{
                filter: 'url(#roughen)',
              }}
            />
            {/* SVG filter for organic line quality */}
            <defs>
              <filter id="roughen">
                <feTurbulence type="turbulence" baseFrequency="0.05" numOctaves="2" result="noise" />
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.5" xChannelSelector="R" yChannelSelector="G" />
              </filter>
            </defs>
          </svg>

          {/* Time display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="text-6xl md:text-7xl text-[#2D2A26] tracking-tight"
              style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 300 }}
            >
              {formatTime(timeLeft)}
            </span>
            <span
              className="text-xs text-[#6B6560] tracking-[0.3em] uppercase mt-2"
              style={{ fontFamily: 'Karla, sans-serif' }}
            >
              {currentConfig.label}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-4 md:gap-6 items-center" style={{ fontFamily: 'Karla, sans-serif' }}>
          <button
            onClick={handleReset}
            className="w-12 h-12 md:w-14 md:h-14 rounded-full border border-[#D4CFC6] text-[#6B6560] hover:border-[#2D2A26] hover:text-[#2D2A26] transition-all duration-300 flex items-center justify-center"
            aria-label="Reset timer"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 3v5h5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <button
            onClick={handleToggle}
            className="w-20 h-20 md:w-24 md:h-24 rounded-full text-[#F5F1EB] shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center transform hover:scale-105 active:scale-95"
            style={{ backgroundColor: currentConfig.color }}
            aria-label={isRunning ? 'Pause timer' : 'Start timer'}
          >
            {isRunning ? (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5.14v14.72a1 1 0 0 0 1.5.86l11-7.36a1 1 0 0 0 0-1.72l-11-7.36a1 1 0 0 0-1.5.86z" />
              </svg>
            )}
          </button>

          <button
            onClick={() => {
              const next = mode === 'focus'
                ? (completedPomodoros % 4 === 3 ? 'longBreak' : 'shortBreak')
                : 'focus';
              handleModeChange(next);
            }}
            className="w-12 h-12 md:w-14 md:h-14 rounded-full border border-[#D4CFC6] text-[#6B6560] hover:border-[#2D2A26] hover:text-[#2D2A26] transition-all duration-300 flex items-center justify-center"
            aria-label="Skip to next session"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M5 4l10 8-10 8V4z" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="19" y1="5" x2="19" y2="19" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Completed pomodoros indicator */}
        <div className="mt-10 md:mt-14 flex items-center gap-3">
          <span className="text-xs text-[#6B6560] tracking-wide" style={{ fontFamily: 'Karla, sans-serif' }}>
            Completed
          </span>
          <div className="flex gap-2">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full transition-all duration-500 ${
                  i < completedPomodoros % 4
                    ? 'scale-100'
                    : 'scale-75 opacity-30'
                }`}
                style={{
                  backgroundColor: i < completedPomodoros % 4 ? TIMER_CONFIGS.focus.color : '#D4CFC6',
                }}
              />
            ))}
          </div>
          {completedPomodoros >= 4 && (
            <span
              className="text-xs ml-1"
              style={{ fontFamily: 'Karla, sans-serif', color: TIMER_CONFIGS.focus.color }}
            >
              +{Math.floor(completedPomodoros / 4)}
            </span>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer
        className="absolute bottom-4 md:bottom-6 left-0 right-0 text-center"
        style={{ fontFamily: 'Karla, sans-serif' }}
      >
        <p className="text-[10px] md:text-xs text-[#A9A49D] tracking-wide">
          Requested by <span className="text-[#8A857E]">@PauliusX</span> · Built by <span className="text-[#8A857E]">@clonkbot</span>
        </p>
      </footer>
    </div>
  );
}

export default App;
