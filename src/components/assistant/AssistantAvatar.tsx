import React from 'react';

export interface AssistantAvatarProps {
  state?: 'idle' | 'listening' | 'speaking' | 'thinking';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const AssistantAvatar: React.FC<AssistantAvatarProps> = ({
  state = 'idle',
  size = 'md'
}) => {
  const sizeMap = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-11 h-11 text-sm',
    lg: 'w-16 h-16 text-base',
    xl: 'w-24 h-24 text-xl'
  };

  const isAnimated = state === 'listening' || state === 'speaking' || state === 'thinking';

  return (
    <div className="relative inline-flex items-center justify-center shrink-0">
      {/* Outer Pulse Rings for Listening/Speaking */}
      {isAnimated && (
        <>
          <div className="absolute inset-0 rounded-full bg-amber-500/25 animate-ping opacity-75"></div>
          <div className="absolute -inset-1.5 rounded-full bg-emerald-500/20 animate-pulse"></div>
        </>
      )}

      {/* Main Avatar Circle */}
      <div 
        className={`${sizeMap[size]} relative rounded-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 border-2 ${
          state === 'listening' 
            ? 'border-amber-400 shadow-lg shadow-amber-500/30' 
            : state === 'thinking'
            ? 'border-emerald-400 shadow-lg shadow-emerald-500/30'
            : state === 'speaking'
            ? 'border-cyan-400 shadow-lg shadow-cyan-500/30'
            : 'border-slate-700 shadow-md'
        } flex items-center justify-center text-white overflow-hidden transition-all duration-300`}
      >
        {/* Tricolor aura highlight */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-white to-emerald-600 opacity-80"></div>

        {/* Dynamic Inner Face Graphic */}
        <div className="relative z-10 flex flex-col items-center justify-center">
          {state === 'thinking' ? (
            <div className="flex gap-1 items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-bounce [animation-delay:0.15s]"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.3s]"></span>
            </div>
          ) : state === 'speaking' ? (
            <div className="flex gap-1 items-end h-4">
              <span className="w-1 bg-cyan-400 rounded-full animate-pulse h-3"></span>
              <span className="w-1 bg-cyan-200 rounded-full animate-bounce h-4"></span>
              <span className="w-1 bg-cyan-400 rounded-full animate-pulse h-2"></span>
            </div>
          ) : (
            <svg 
              viewBox="0 0 24 24" 
              className={`w-6 h-6 ${state === 'listening' ? 'text-amber-400' : 'text-amber-500'} transition-colors`}
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
            >
              {/* Sleek Bot Eyes & Smile */}
              <circle cx="9" cy="10" r="1.5" fill="currentColor" />
              <circle cx="15" cy="10" r="1.5" fill="currentColor" />
              <path 
                d={state === 'listening' ? "M8 15h8" : "M9 14.5c.8 1 2 1.5 3 1.5s2.2-.5 3-1.5"} 
                strokeLinecap="round" 
              />
              <path d="M12 4v2" strokeLinecap="round" />
            </svg>
          )}
        </div>
      </div>

      {/* Online / State Indicator Dot */}
      <span 
        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
          state === 'listening' 
            ? 'bg-amber-500 animate-pulse' 
            : state === 'thinking'
            ? 'bg-blue-500 animate-pulse'
            : state === 'speaking'
            ? 'bg-cyan-400 animate-pulse'
            : 'bg-emerald-500'
        }`}
        title={`Status: ${state}`}
      />
    </div>
  );
};
