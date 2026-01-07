'use client';

import { useState } from 'react';
import { MapPin, ExternalLink, Copy, Check, Settings, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function GPSSetupGuide() {
  const [copiedStep, setCopiedStep] = useState<number | null>(null);

  const copyToClipboard = async (text: string, step: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStep(step);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopiedStep(null), 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const setupSteps = [
    {
      title: "Enable Google Maps APIs",
      description: "Go to Google Cloud Console and enable the required APIs",
      action: "Open Google Cloud Console",
      url: "https://console.cloud.google.com/apis/library",
      copyText: "Maps JavaScript API, Places API, Directions API, Geolocation API"
    },
    {
      title: "Create API Key",
      description: "Generate a new API key in the Credentials section",
      action: "Go to Credentials",
      url: "https://console.cloud.google.com/apis/credentials",
      copyText: "Create Credentials → API Key"
    },
    {
      title: "Configure Environment",
      description: "Add your API key to the environment variables",
      action: "Copy Environment Variable",
      copyText: "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here"
    },
    {
      title: "Restart Development Server",
      description: "Restart your development server to load the new environment variables",
      action: "Copy Command",
      copyText: "npm run dev"
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <MapPin className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">GPS Map Setup</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Enable interactive GPS maps for your itineraries
        </p>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Google Maps API key required:</strong> To use GPS functionality, you need to configure a Google Maps API key. 
          This enables real-time location tracking, interactive maps, and turn-by-turn navigation.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6">
        {setupSteps.map((step, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                  {index + 1}
                </Badge>
                {step.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{step.description}</p>
              <div className="flex flex-wrap gap-2">
                {step.url && (
                  <Button variant="outline" asChild>
                    <a href={step.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      {step.action}
                    </a>
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  onClick={() => copyToClipboard(step.copyText, index)}
                  className="font-mono text-sm"
                >
                  {copiedStep === index ? (
                    <Check className="w-4 h-4 mr-2 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4 mr-2" />
                  )}
                  {step.copyText}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Features You'll Get
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-sm">Real-time GPS location tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-sm">Interactive map with zoom and pan</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-sm">Turn-by-turn navigation</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-sm">Optimized route planning</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-sm">Activity markers with details</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-sm">Multi-stop route optimization</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-sm">Street view integration</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-sm">Offline map caching</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <AlertDescription>
          <strong>Cost Information:</strong> Google Maps APIs have usage-based pricing. 
          The first $200 of usage each month is free, which covers most development and small-scale usage. 
          Monitor your usage in the Google Cloud Console.
        </AlertDescription>
      </Alert>
    </div>
  );
}