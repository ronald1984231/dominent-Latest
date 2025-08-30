interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function Logo({
  className = "",
  size = "md",
  showText = true,
}: LogoProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Logo Icon */}
      <div className="relative">
        <svg
          className={`${sizeClasses[size]} transition-transform hover:scale-105`}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Background Circle */}
          <circle
            cx="24"
            cy="24"
            r="22"
            fill="url(#gradient1)"
            stroke="url(#gradient2)"
            strokeWidth="2"
          />

          {/* Globe/Domain Icon */}
          <circle
            cx="24"
            cy="24"
            r="14"
            stroke="white"
            strokeWidth="1.5"
            fill="none"
          />

          {/* Longitude lines */}
          <path
            d="M10 24C10 24 16 14 24 14C32 14 38 24 38 24C38 24 32 34 24 34C16 34 10 24 10 24Z"
            stroke="white"
            strokeWidth="1.2"
            fill="none"
          />

          {/* Latitude lines */}
          <path
            d="M24 10C24 10 14 16 14 24C14 32 24 38 24 38C24 38 34 32 34 24C34 16 24 10 24 10Z"
            stroke="white"
            strokeWidth="1.2"
            fill="none"
          />

          {/* Central monitoring dot */}
          <circle cx="24" cy="24" r="2.5" fill="white" />

          {/* Monitoring pulse rings */}
          <circle
            cx="24"
            cy="24"
            r="8"
            stroke="white"
            strokeWidth="1"
            fill="none"
            opacity="0.6"
            className="animate-pulse"
            style={{
              animation: 'pulse-ring 2s ease-in-out infinite'
            }}
          />

          <style jsx>{`
            @keyframes pulse-ring {
              0%, 100% {
                transform: scale(0.75);
                opacity: 0.6;
              }
              50% {
                transform: scale(1.25);
                opacity: 0.1;
              }
            }
          `}</style>

          {/* Gradients */}
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#1E40AF" />
            </linearGradient>
            <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60A5FA" />
              <stop offset="100%" stopColor="#2563EB" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Logo Text */}
      {showText && (
        <span
          className={`font-bold text-gray-900 tracking-tight ${textSizeClasses[size]}`}
        >
          <span className="text-blue-600">DOMI</span>
          <span className="text-gray-900">NENT</span>
        </span>
      )}
    </div>
  );
}

// Alternative minimalist version for smaller spaces
export function LogoMini({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center ${className}`}>
      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
        <span className="text-white font-bold text-sm">D</span>
      </div>
    </div>
  );
}
