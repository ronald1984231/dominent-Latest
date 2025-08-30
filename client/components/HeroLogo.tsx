interface HeroLogoProps {
  className?: string;
}

export function HeroLogo({ className = "" }: HeroLogoProps) {
  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      {/* Large Logo Icon */}
      <div className="relative">
        <svg 
          className="h-24 w-24 drop-shadow-lg" 
          viewBox="0 0 96 96" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Background Circle with enhanced shadow */}
          <circle 
            cx="48" 
            cy="48" 
            r="44" 
            fill="url(#heroGradient1)" 
            stroke="url(#heroGradient2)" 
            strokeWidth="3"
            filter="url(#shadow)"
          />
          
          {/* Globe/Domain Icon */}
          <circle 
            cx="48" 
            cy="48" 
            r="28" 
            stroke="white" 
            strokeWidth="2.5" 
            fill="none"
          />
          
          {/* Longitude lines */}
          <path 
            d="M20 48C20 48 32 28 48 28C64 28 76 48 76 48C76 48 64 68 48 68C32 68 20 48 20 48Z" 
            stroke="white" 
            strokeWidth="2" 
            fill="none"
          />
          
          {/* Latitude lines */}
          <path 
            d="M48 20C48 20 28 32 28 48C28 64 48 76 48 76C48 76 68 64 68 48C68 32 48 20 48 20Z" 
            stroke="white" 
            strokeWidth="2" 
            fill="none"
          />
          
          {/* Central monitoring dot */}
          <circle 
            cx="48" 
            cy="48" 
            r="4" 
            fill="white"
          />
          
          {/* Multiple monitoring pulse rings */}
          <circle 
            cx="48" 
            cy="48" 
            r="12" 
            stroke="white" 
            strokeWidth="1.5" 
            fill="none" 
            opacity="0.7"
          >
            <animate 
              attributeName="r" 
              values="12;20;12" 
              dur="3s" 
              repeatCount="indefinite"
            />
            <animate 
              attributeName="opacity" 
              values="0.7;0.1;0.7" 
              dur="3s" 
              repeatCount="indefinite"
            />
          </circle>
          
          <circle 
            cx="48" 
            cy="48" 
            r="8" 
            stroke="white" 
            strokeWidth="1" 
            fill="none" 
            opacity="0.5"
          >
            <animate 
              attributeName="r" 
              values="8;16;8" 
              dur="2s" 
              repeatCount="indefinite"
            />
            <animate 
              attributeName="opacity" 
              values="0.5;0.1;0.5" 
              dur="2s" 
              repeatCount="indefinite"
            />
          </circle>

          {/* Enhanced Gradients and Effects */}
          <defs>
            <linearGradient id="heroGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="50%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#1E40AF" />
            </linearGradient>
            <linearGradient id="heroGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60A5FA" />
              <stop offset="100%" stopColor="#2563EB" />
            </linearGradient>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#0000001A"/>
            </filter>
          </defs>
        </svg>
      </div>

      {/* Large Logo Text */}
      <div className="text-center">
        <h1 className="text-5xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            DOMI
          </span>
          <span className="text-gray-900">NENT</span>
        </h1>
        <p className="text-lg text-gray-600 font-medium mt-2 tracking-wide">
          Domain Monitoring Platform
        </p>
      </div>
    </div>
  );
}
