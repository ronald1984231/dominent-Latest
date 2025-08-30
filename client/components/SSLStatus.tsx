import { Shield, ShieldAlert, ShieldX, Clock } from "lucide-react";
import { Badge } from "./ui/badge";
import { cn } from "../lib/utils";

interface SSLStatusProps {
  sslExpiry?: string;
  lastSslCheck?: string;
  className?: string;
  showDetails?: boolean;
}

export function SSLStatus({ 
  sslExpiry, 
  lastSslCheck, 
  className,
  showDetails = true 
}: SSLStatusProps) {
  const getSSLStatus = (): 'VALID' | 'EXPIRING' | 'EXPIRED' | 'UNKNOWN' => {
    if (!sslExpiry) return 'UNKNOWN';

    const expiry = new Date(sslExpiry);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'EXPIRED';
    if (diffDays <= 30) return 'EXPIRING';
    return 'VALID';
  };

  const formatSSLExpiry = () => {
    if (!sslExpiry) return 'Unknown';

    const expiry = new Date(sslExpiry);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return 'Expired';
    } else if (diffDays === 0) {
      return 'Expires today';
    } else if (diffDays <= 30) {
      return `${diffDays} days`;
    } else if (diffDays <= 90) {
      return `${diffDays} days`;
    } else {
      return expiry.toLocaleDateString();
    }
  };

  const status = getSSLStatus();

  const statusConfig = {
    VALID: {
      icon: Shield,
      text: 'Valid',
      variant: 'default' as const,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-700',
      iconColor: 'text-green-600'
    },
    EXPIRING: {
      icon: ShieldAlert,
      text: 'Expiring',
      variant: 'secondary' as const,
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      textColor: 'text-orange-700',
      iconColor: 'text-orange-600'
    },
    EXPIRED: {
      icon: ShieldX,
      text: 'Expired',
      variant: 'destructive' as const,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-700',
      iconColor: 'text-red-600'
    },
    UNKNOWN: {
      icon: Clock,
      text: 'Unknown',
      variant: 'secondary' as const,
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      textColor: 'text-gray-700',
      iconColor: 'text-gray-500'
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={cn("space-y-2", className)}>
      {/* Main Status Badge */}
      <div className={cn(
        "inline-flex items-center gap-2 px-3 py-2 rounded-lg border",
        config.bgColor,
        config.borderColor
      )}>
        <Icon className={cn("w-4 h-4", config.iconColor)} />
        <span className={cn("text-sm font-medium", config.textColor)}>
          {config.text}
        </span>
        {status === 'EXPIRING' && sslExpiry && (
          <Badge variant="outline" className="ml-1 text-xs border-orange-300 text-orange-700">
            {formatSSLExpiry()}
          </Badge>
        )}
      </div>

      {/* Details */}
      {showDetails && (
        <div className="text-xs text-muted-foreground space-y-1">
          {sslExpiry ? (
            <div className="flex items-center gap-1">
              <span>Expires:</span>
              <span className="font-medium">
                {new Date(sslExpiry).toLocaleDateString()}
              </span>
            </div>
          ) : lastSslCheck ? (
            <div className="flex items-center gap-1">
              <span>Last checked:</span>
              <span>{new Date(lastSslCheck).toLocaleDateString()}</span>
            </div>
          ) : (
            <span>Not checked</span>
          )}
        </div>
      )}
    </div>
  );
}

// Compact version for table cells
export function SSLStatusCompact({ 
  sslExpiry, 
  lastSslCheck, 
  className 
}: SSLStatusProps) {
  const getSSLStatus = (): 'VALID' | 'EXPIRING' | 'EXPIRED' | 'UNKNOWN' => {
    if (!sslExpiry) return 'UNKNOWN';

    const expiry = new Date(sslExpiry);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'EXPIRED';
    if (diffDays <= 30) return 'EXPIRING';
    return 'VALID';
  };

  const formatSSLExpiry = () => {
    if (!sslExpiry) return 'Unknown';

    const expiry = new Date(sslExpiry);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return 'Expired';
    } else if (diffDays === 0) {
      return 'Expires today';
    } else if (diffDays <= 30) {
      return `${diffDays} days`;
    } else if (diffDays <= 90) {
      return `${diffDays} days`;
    } else {
      return expiry.toLocaleDateString();
    }
  };

  const status = getSSLStatus();

  const statusConfig = {
    VALID: {
      icon: Shield,
      text: 'Valid',
      iconColor: 'text-green-600',
      dotColor: 'bg-green-500'
    },
    EXPIRING: {
      icon: ShieldAlert,
      text: 'Expiring',
      iconColor: 'text-orange-600',
      dotColor: 'bg-orange-500'
    },
    EXPIRED: {
      icon: ShieldX,
      text: 'Expired',
      iconColor: 'text-red-600',
      dotColor: 'bg-red-500'
    },
    UNKNOWN: {
      icon: Clock,
      text: 'Unknown',
      iconColor: 'text-gray-500',
      dotColor: 'bg-gray-400'
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={cn("space-y-1", className)}>
      {/* Status with icon */}
      <div className="flex items-center gap-2">
        <div className={cn("w-2 h-2 rounded-full", config.dotColor)} />
        <Icon className={cn("w-4 h-4", config.iconColor)} />
        <span className={cn("text-sm font-medium", config.iconColor)}>
          {config.text}
        </span>
      </div>

      {/* Expiry info */}
      <div className="text-xs text-muted-foreground pl-6">
        {sslExpiry ? (
          <span>
            Expires: {formatSSLExpiry()}
          </span>
        ) : lastSslCheck ? (
          <span>
            Last checked: {new Date(lastSslCheck).toLocaleDateString()}
          </span>
        ) : (
          <span>Not checked</span>
        )}
      </div>
    </div>
  );
}
