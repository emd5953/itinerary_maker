'use client';

import { useState } from 'react';
import { Locate, Navigation, Route, MapPin, ExternalLink, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ScheduledActivity } from '@/lib/api';

interface LocationServicesProps {
  activities: ScheduledActivity[];
  destination: string;
}

export default function LocationServices({ activities, destination }: LocationServicesProps) {
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by this browser');
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ lat: latitude, lng: longitude });
        setGettingLocation(false);
        toast.success('Location found!');
      },
      (error) => {
        console.error('Error getting location:', error);
        setGettingLocation(false);
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error('Location access denied. Please enable location services.');
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error('Location information is unavailable.');
            break;
          case error.TIMEOUT:
            toast.error('Location request timed out.');
            break;
          default:
            toast.error('An unknown error occurred while getting location.');
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  const getDirectionsFromCurrentLocation = (activity: ScheduledActivity) => {
    if (!currentLocation) {
      getCurrentLocation();
      return;
    }

    const url = `https://www.google.com/maps/dir/${currentLocation.lat},${currentLocation.lng}/${activity.location.latitude},${activity.location.longitude}`;
    window.open(url, '_blank');
  };

  const getMultiStopRoute = () => {
    if (activities.length === 0) return;

    const waypoints = activities.slice(1, -1).map(activity => 
      `${activity.location.latitude},${activity.location.longitude}`
    ).join('|');
    
    let url = '';
    
    if (currentLocation) {
      // Start from current location
      const destination = `${activities[activities.length - 1].location.latitude},${activities[activities.length - 1].location.longitude}`;
      url = `https://www.google.com/maps/dir/${currentLocation.lat},${currentLocation.lng}/${destination}`;
      if (waypoints) {
        url += `?waypoints=${waypoints}`;
      }
    } else {
      // Start from first activity
      const origin = `${activities[0].location.latitude},${activities[0].location.longitude}`;
      const destination = `${activities[activities.length - 1].location.latitude},${activities[activities.length - 1].location.longitude}`;
      url = `https://www.google.com/maps/dir/${origin}/${destination}`;
      if (waypoints) {
        url += `?waypoints=${waypoints}`;
      }
    }
    
    window.open(url, '_blank');
  };

  const openInAppleMaps = (activity: ScheduledActivity) => {
    const url = `http://maps.apple.com/?daddr=${activity.location.latitude},${activity.location.longitude}`;
    window.open(url, '_blank');
  };

  const openInWaze = (activity: ScheduledActivity) => {
    const url = `https://waze.com/ul?ll=${activity.location.latitude},${activity.location.longitude}&navigate=yes`;
    window.open(url, '_blank');
  };

  const shareLocation = async (activity: ScheduledActivity) => {
    const shareData = {
      title: activity.name,
      text: `Check out ${activity.name} in ${destination}`,
      url: `https://www.google.com/maps/search/?api=1&query=${activity.location.latitude},${activity.location.longitude}`
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        toast.success('Location link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error('Could not share location');
    }
  };

  if (activities.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <MapPin className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-muted-foreground">No activities to navigate to</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Navigation className="w-5 h-5" />
          GPS & Navigation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Location */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Locate className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">
              {currentLocation ? 'Location found' : 'Get your location'}
            </span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={getCurrentLocation}
            disabled={gettingLocation}
          >
            {gettingLocation ? 'Getting...' : currentLocation ? 'Update' : 'Get Location'}
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Button 
            variant="outline" 
            onClick={getMultiStopRoute}
            className="flex items-center gap-2"
          >
            <Route className="w-4 h-4" />
            Full Route
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => {
              const searchQuery = activities.map(a => a.name).join(', ') + ` ${destination}`;
              window.open(`https://www.google.com/maps/search/${encodeURIComponent(searchQuery)}`, '_blank');
            }}
            className="flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Search Area
          </Button>
        </div>

        {/* Individual Activities */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Navigate to Activities</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {activities.map((activity, index) => (
              <div key={activity.id} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Badge variant="outline" className="text-xs">
                    {index + 1}
                  </Badge>
                  <span className="text-sm truncate">{activity.name}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => getDirectionsFromCurrentLocation(activity)}
                    className="h-8 w-8 p-0"
                    title="Google Maps"
                  >
                    <Navigation className="w-3 h-3" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openInAppleMaps(activity)}
                    className="h-8 w-8 p-0"
                    title="Apple Maps"
                  >
                    <Smartphone className="w-3 h-3" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => shareLocation(activity)}
                    className="h-8 w-8 p-0"
                    title="Share Location"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alternative Apps */}
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground mb-2">Open in other apps:</p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => activities[0] && openInWaze(activities[0])}
              disabled={activities.length === 0}
            >
              Waze
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => activities[0] && openInAppleMaps(activities[0])}
              disabled={activities.length === 0}
            >
              Apple Maps
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}