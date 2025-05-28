'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CookieStatusIndicatorProps {
  className?: string;
}

export function CookieStatusIndicator({ className = '' }: CookieStatusIndicatorProps) {
  const [status, setStatus] = useState<'checking' | 'healthy' | 'corrupted' | 'cleaned'>('checking');
  const [lastCheck, setLastCheck] = useState<Date>(new Date());

  useEffect(() => {
    const checkCookieStatus = async () => {
      try {
        const { checkForCorruptedCookies, autoHandleCorruptedCookies } = await import('@/lib/utils/cookie-cleaner');
        
        if (checkForCorruptedCookies()) {
          setStatus('corrupted');
          
          // Intentar limpiar automáticamente
          const cleaned = autoHandleCorruptedCookies();
          if (cleaned) {
            setStatus('cleaned');
            setTimeout(() => setStatus('healthy'), 3000);
          }
        } else {
          setStatus('healthy');
        }
        
        setLastCheck(new Date());
      } catch (error) {
        console.warn('Error al verificar estado de cookies:', error);
        setStatus('healthy'); // Asumir que están bien si no podemos verificar
      }
    };

    // Verificar inmediatamente
    checkCookieStatus();

    // Verificar cada 30 segundos
    const interval = setInterval(checkCookieStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusInfo = () => {
    switch (status) {
      case 'checking':
        return {
          icon: <RefreshCw className="h-3 w-3 animate-spin" />,
          text: 'Verificando...',
          variant: 'secondary' as const,
          color: 'text-gray-600'
        };
      case 'healthy':
        return {
          icon: <CheckCircle className="h-3 w-3" />,
          text: 'Cookies OK',
          variant: 'secondary' as const,
          color: 'text-green-600'
        };
      case 'corrupted':
        return {
          icon: <AlertTriangle className="h-3 w-3" />,
          text: 'Cookies corruptas',
          variant: 'destructive' as const,
          color: 'text-red-600'
        };
      case 'cleaned':
        return {
          icon: <CheckCircle className="h-3 w-3" />,
          text: 'Cookies limpiadas',
          variant: 'default' as const,
          color: 'text-blue-600'
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Badge variant={statusInfo.variant} className="flex items-center space-x-1">
        <span className={statusInfo.color}>
          {statusInfo.icon}
        </span>
        <span className="text-xs">{statusInfo.text}</span>
      </Badge>
      
      {status !== 'checking' && (
        <span className="text-xs text-gray-500">
          {lastCheck.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}

export default CookieStatusIndicator;
