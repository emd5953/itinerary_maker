'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Clock, Locate, Route, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { DayPlan, ScheduledActivity } from '@/lib/api';

interface ItineraryMapProps {
  dayPlans: DayPlan[];
  selectedDay?: number;
  onDaySelect?: (dayNumber: number) => void;
  onActivitySelect?: (activity: ScheduledActivity) => void;
}

// Mock map component - in a real app, you'd use Google Maps, Mapbox, etc.
export default function ItineraryMap({ 
  dayPlans, 
  selectedDay = 1, 
  onDaySelect, 
  onActivitySelect 
}: ItineraryMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedActivity, setSelectedActivity] = useState<ScheduledActivity | null>(null);

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

  const handleActivityClick = (activity: ScheduledActivity) => {
    setSelectedActivity(activity);
    onActivitySelect?.(activity);
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

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          if (currentDayPlan?.activities.length) {
            const firstActivity = currentDayPlan.activities[0];
            const url = `https://www.google.com/maps/dir/${latitude},${longitude}/${firstActivity.location.latitude},${firstActivity.location.longitude}`;
            window.open(url, '_blank');
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          toast.error('Could not get your current location');
        }
      );
    } else {
      toast.error('Geolocation is not supported by this browser');
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Map Area */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Day {selectedDay} Map
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              ref={mapRef}
              className="w-full h-64 bg-muted rounded-lg relative overflow-hidden"
            >
              {/* Mock map visualization */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50">
                <div className="absolute inset-4 border-2 border-dashed border-muted-foreground/20 rounded flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <MapPin className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">Interactive Map</p>
                    <p className="text-xs">Shows {currentDayPlan?.activities.length || 0} activities</p>
                  </div>
                </div>
                
                {/* Mock activity markers */}
                {currentDayPlan?.activities.map((activity, index) => (
                  <button
                    key={activity.id}
                    onClick={() => handleActivityClick(activity)}
                    className="absolute w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold hover:scale-110 transition-transform"
                    style={{
                      backgroundColor: getCategoryColor(activity.category),
                      left: `${20 + (index * 15) % 60}%`,
                      top: `${30 + (index * 10) % 40}%`,
                    }}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mt-4 flex flex-col gap-2">
              <p className="text-sm text-muted-foreground mb-2">
                Click markers to view activity details
              </p>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={openInGoogleMaps}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Full Route
                </Button>
                <Button variant="outline" size="sm" onClick={getCurrentLocation}>
                  <Locate className="w-4 h-4 mr-2" />
                  Navigate from Here
                </Button>
                {currentDayPlan?.activities.length > 1 && (
                  <Button variant="outline" size="sm" onClick={() => {
                    const url = getMultiStopDirectionsUrl(currentDayPlan.activities);
                    window.open(url, '_blank');
                  }}>
                    <Route className="w-4 h-4 mr-2" />
                    Multi-Stop Route
                  </Button>
                )}
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
                  onClick={() => handleActivityClick(activity)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedActivity?.id === activity.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
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
                      
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                        <Clock className="w-3 h-3" />
                        <span>{activity.startTime.substring(0, 5)} - {activity.endTime.substring(0, 5)}</span>
                      </div>
                      
                      <p className="text-xs text-muted-foreground truncate">
                        {activity.location.address}
                      </p>
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

      {/* Selected Activity Details */}
      {selectedActivity && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{selectedActivity.name}</span>
              <Button variant="outline" size="sm" asChild>
                <a 
                  href={getDirectionsUrl(selectedActivity)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  Directions
                </a>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>{selectedActivity.startTime.substring(0, 5)} - {selectedActivity.endTime.substring(0, 5)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{selectedActivity.location.address}</span>
                  </div>
                  {selectedActivity.rating && (
                    <div className="flex items-center gap-2">
                      <span>⭐</span>
                      <span>{selectedActivity.rating} rating</span>
                    </div>
                  )}
                  {selectedActivity.priceRange && (
                    <div className="flex items-center gap-2">
                      <span>💰</span>
                      <span>{selectedActivity.priceRange}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {selectedActivity.description && (
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedActivity.description}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}