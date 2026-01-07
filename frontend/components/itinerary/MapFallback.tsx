'use client';

import { MapPin, ExternalLink, Settings, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { DayPlan, ScheduledActivity } from '@/lib/api';

interface MapFallbackProps {
  dayPlans: DayPlan[];
  selectedDay?: number;
  onDaySelect?: (dayNumber: number) => void;
  onActivitySelect?: (activity: ScheduledActivity) => void;
  reason?: 'no-api-key' | 'load-error' | 'not-supported';
}

export default function MapFallback({ 
  dayPlans, 
  selectedDay = 1, 
  onDaySelect, 
  onActivitySelect,
  reason = 'no-api-key'
}: MapFallbackProps) {
  const currentDayPlan = dayPlans[selectedDay - 1];
  
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'SIGHTS': '#3b82f6',
      'FOOD': '#f97316',
      'OUTDOOR': '#22c55e',
      'NIGHTLIFE': '#a855f7',
      'SHOPPING': '#ec4899',
      'CULTURE': '#6366f1',
      'ADVENTURE': '#ef4444',
      'RELAXATION': '#14b8a6',
    };
    return colors[category] || '#6b7280';
  };

  const getDirectionsUrl = (activity: ScheduledActivity) => {
    const { latitude, longitude } = activity.location;
    return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
  };

  const getMultiStopDirectionsUrl = (activities: ScheduledActivity[]) => {
    if (activities.length === 0) return '';
    
    const waypoints = activities.slice(1, -1).map(activity => 
      `${activity.location.latitude},${activity.location.longitude}`
    ).join('|');
    
    const origin = `${activities[0].location.latitude},${activities[0].location.longitude}`;
    const destination = `${activities[activities.length - 1].location.latitude},${activities[activities.length - 1].location.longitude}`;
    
    let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
    if (waypoints) {
      url += `&waypoints=${waypoints}`;
    }
    return url;
  };

  const openInGoogleMaps = () => {
    if (!currentDayPlan?.activities.length) return;
    
    if (currentDayPlan.activities.length === 1) {
      window.open(getDirectionsUrl(currentDayPlan.activities[0]), '_blank');
    } else {
      window.open(getMultiStopDirectionsUrl(currentDayPlan.activities), '_blank');
    }
  };

  const getAlertMessage = () => {
    switch (reason) {
      case 'no-api-key':
        return 'Google Maps API key not configured. Add your API key to enable interactive GPS maps.';
      case 'load-error':
        return 'Failed to load Google Maps. Check your internet connection and API key.';
      case 'not-supported':
        return 'Interactive maps are not supported in this environment.';
      default:
        return 'Interactive maps are currently unavailable.';
    }
  };

  return (
    <div className="space-y-4">
      {/* Day Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {dayPlans.map((_, index) => (
          <Button
            key={index}
            variant={selectedDay === index + 1 ? "default" : "outline"}
            size="sm"
            onClick={() => onDaySelect?.(index + 1)}
            className="whitespace-nowrap"
          >
            Day {index + 1}
          </Button>
        ))}
      </div>

      {/* Setup Alert */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {getAlertMessage()}
          {reason === 'no-api-key' && (
            <div className="mt-2 space-y-2">
              <span className="block">
                See <code>docs/GPS_SETUP.md</code> for setup instructions.
              </span>
              <Button variant="outline" size="sm" asChild>
                <a href="/setup/gps" target="_blank">
                  <Settings className="w-4 h-4 mr-2" />
                  Setup Guide
                </a>
              </Button>
            </div>
          )}
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Static Map Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Day {selectedDay} Map
              <Badge variant="outline" className="ml-auto">
                <Settings className="w-3 h-3 mr-1" />
                Setup Required
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full h-64 bg-muted rounded-lg relative overflow-hidden border-2 border-dashed border-muted-foreground/20">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">GPS Map Unavailable</p>
                  <p className="text-sm mb-4">Configure Google Maps API for interactive maps</p>
                  
                  {/* Mock activity markers */}
                  {currentDayPlan?.activities.map((activity, index) => (
                    <div
                      key={activity.id}
                      className="absolute w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold opacity-50"
                      style={{
                        backgroundColor: getCategoryColor(activity.category),
                        left: `${20 + (index * 15) % 60}%`,
                        top: `${30 + (index * 10) % 40}%`,
                      }}
                    >
                      {index + 1}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex flex-col gap-2">
              <p className="text-sm text-muted-foreground mb-2">
                Use external maps for navigation
              </p>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={openInGoogleMaps}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open in Google Maps
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity List */}
        <Card>
          <CardHeader>
            <CardTitle>Day {selectedDay} Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {currentDayPlan?.activities.map((activity, index) => (
                <div
                  key={activity.id}
                  onClick={() => onActivitySelect?.(activity)}
                  className="p-3 rounded-lg border cursor-pointer transition-all hover:border-primary/50"
                >
                  <div className="flex items-start gap-3">
                    <div 
                      className="w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ backgroundColor: getCategoryColor(activity.category) }}
                    >
                      {index + 1}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm truncate">{activity.name}</h4>
                        {activity.rating && (
                          <Badge variant="secondary" className="text-xs">
                            ⭐ {activity.rating}
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-xs text-muted-foreground truncate mb-2">
                        {activity.location.address}
                      </p>
                      
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 px-2 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(getDirectionsUrl(activity), '_blank');
                        }}
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Open in Maps
                      </Button>
                    </div>
                  </div>
                </div>
              )) || (
                <div className="text-center py-8 text-muted-foreground">
                  <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No activities for this day</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}