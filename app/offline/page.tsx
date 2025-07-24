
'use client';

import { useEffect, useState } from 'react';
import { WifiOff, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    // Initial check
    updateOnlineStatus();

    // Listen for online/offline events
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  const handleRetry = () => {
    if (isOnline) {
      window.location.reload();
    }
  };

  if (isOnline) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <RefreshCw className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-green-700">Verbinding Hersteld</CardTitle>
            <CardDescription>
              Je internetverbinding is hersteld. Klik hieronder om door te gaan.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleRetry} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Pagina Vernieuwen
            </Button>
            <Link href="/" className="block">
              <Button variant="outline" className="w-full">
                <Home className="mr-2 h-4 w-4" />
                Naar Homepage
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <WifiOff className="w-8 h-8 text-gray-600" />
          </div>
          <CardTitle className="text-gray-700">Geen Internetverbinding</CardTitle>
          <CardDescription>
            Je bent momenteel offline. Controleer je internetverbinding en probeer het opnieuw.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Wat kun je doen:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Controleer je WiFi verbinding</li>
              <li>• Controleer je mobiele data</li>
              <li>• Probeer het over een paar minuten opnieuw</li>
              <li>• Sommige pagina's zijn mogelijk nog beschikbaar offline</li>
            </ul>
          </div>
          
          <Button 
            onClick={handleRetry} 
            className="w-full"
            disabled={!isOnline}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Opnieuw Proberen
          </Button>
          
          <Link href="/" className="block">
            <Button variant="outline" className="w-full">
              <Home className="mr-2 h-4 w-4" />
              Naar Homepage (Offline)
            </Button>
          </Link>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              Status: <span className={isOnline ? "text-green-600" : "text-red-600"}>
                {isOnline ? "Online" : "Offline"}
              </span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
