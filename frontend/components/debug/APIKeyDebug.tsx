'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function APIKeyDebug() {
  const [showKey, setShowKey] = useState(false);
  const [apiKey, setApiKey] = useState<string>('');

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    setApiKey(key || 'NOT_SET');
  }, []);

  const maskedKey = apiKey.length > 10 
    ? `${apiKey.substring(0, 6)}...${apiKey.substring(apiKey.length - 4)}`
    : apiKey;

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          API Key Debug
          <Badge variant={apiKey && apiKey !== 'NOT_SET' && apiKey !== 'YOUR_GOOGLE_MAPS_API_KEY_HERE' ? 'default' : 'destructive'}>
            {apiKey && apiKey !== 'NOT_SET' && apiKey !== 'YOUR_GOOGLE_MAPS_API_KEY_HERE' ? 'Configured' : 'Missing'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Google Maps API Key:</span>
            <code className="text-xs bg-muted px-2 py-1 rounded">
              {showKey ? apiKey : maskedKey}
            </code>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowKey(!showKey)}
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>
          <div className="text-xs text-muted-foreground">
            Length: {apiKey.length} characters
          </div>
        </div>
      </CardContent>
    </Card>
  );
}