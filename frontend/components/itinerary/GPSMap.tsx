'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { MapPin, Navigation, Clock, Locate, Route, ExternalLink, Crosshair, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { DayPlan, ScheduledActivity } from '@/lib/api';
import MapFallback from './MapFallback';

interface GPSMapProps {
  dayPlans: DayPlan[];
  selectedDay?: number;
  onDaySelect?: (dayNumber: number) => void;
  onActivitySelect?: (activity: ScheduledActivity) => void;
}

interface UserLocation {
  lat: number;
  lng: number;
  accuracy?: number;
}

export default function GPSMap({ 
  dayPlans, 
  selectedDay: initialSelectedDay = 1, 
  onDaySelect, 
  onActivitySelect 
}: GPSMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const userMarkerRef = useRef<google.maps.Marker | null>(null);
  const directionsServiceRef = useRef<google.maps.DirectionsService | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  
  const [selectedDay, setSelectedDay] = useState(initialSelectedDay);
  const [selectedActivity, setSelectedActivity] = useState<ScheduledActivity | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showRoute, setShowRoute] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);

  const currentDayPlan = dayPlans[selectedDay - 1];
  
  // Check if API key is available
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    console.log('GPS Map - API Key check:', {
      apiKey: apiKey ? `${apiKey.substring(0, 6)}...${apiKey.substring(apiKey.length - 4)}` : 'NOT_SET',
      length: apiKey?.length || 0,
      isPlaceholder: apiKey === 'YOUR_GOOGLE_MAPS_API_KEY_HERE'
    });
    
    if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
      console.log('GPS Map - API key missing, showing fallback');
      setApiKeyMissing(true);
    } else {
      console.log('GPS Map - API key found, initializing map');
      setApiKeyMissing(false);
    }
  }, []);
  
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

  // Initialize Google Maps
  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current) return;

      try {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        console.log('Initializing Google Maps with API key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT_FOUND');
        
        if (!apiKey) {
          console.error('No API key found');
          setApiKeyMissing(true);
          return;
        }

        // Check if Google Maps is already loaded
        if (typeof window.google === 'undefined') {
          console.log('Loading Google Maps script...');
          
          // Create and load the script
          const script = document.createElement('script');
          script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry&callback=initGoogleMap`;
          script.async = true;
          script.defer = true;
          
          // Create a global callback function
          (window as any).initGoogleMap = () => {
            console.log('Google Maps callback triggered');
            createMap();
          };
          
          script.onerror = (error) => {
            console.error('Failed to load Google Maps script:', error);
            setApiKeyMissing(true);
          };
          
          document.head.appendChild(script);
        } else {
          console.log('Google Maps already loaded');
          createMap();
        }
        
        function createMap() {
          try {
            console.log('Creating Google Maps instance...');
            
            // Default center (will be updated when activities are loaded)
            const defaultCenter = { lat: 40.7128, lng: -74.0060 }; // NYC
            
            const map = new google.maps.Map(mapRef.current!, {
              zoom: 13,
              center: defaultCenter,
              mapTypeControl: true,
              streetViewControl: true,
              fullscreenControl: true,
              zoomControl: true,
            });

            console.log('Google Maps instance created successfully');
            googleMapRef.current = map;
            
            directionsServiceRef.current = new google.maps.DirectionsService();
            directionsRendererRef.current = new google.maps.DirectionsRenderer({
              suppressMarkers: false,
              polylineOptions: {
                strokeColor: '#3b82f6',
                strokeWeight: 4,
                strokeOpacity: 0.8
              }
            });
            
            directionsRendererRef.current.setMap(map);
            setMapLoaded(true);
            console.log('Map initialization complete');
            
          } catch (mapError) {
            console.error('Error creating map:', mapError);
            setApiKeyMissing(true);
          }
        }
        
      } catch (error) {
        console.error('Error in initMap:', error);
        setApiKeyMissing(true);
      }
    };

    initMap();
  }, []);

  // Update markers when day changes or activities change
  useEffect(() => {
    if (!mapLoaded || !googleMapRef.current || !currentDayPlan?.activities.length) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Clear existing route
    if (directionsRendererRef.current && !showRoute) {
      directionsRendererRef.current.setDirections({ routes: [] } as any);
    }

    const bounds = new google.maps.LatLngBounds();
    
    // Add activity markers
    currentDayPlan.activities.forEach((activity, index) => {
      const position = {
        lat: activity.location.latitude,
        lng: activity.location.longitude
      };

      const marker = new google.maps.Marker({
        position,
        map: googleMapRef.current,
        title: activity.name,
        label: {
          text: (index + 1).toString(),
          color: 'white',
          fontWeight: 'bold'
        },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: getCategoryColor(activity.category),
          fillOpacity: 1,
          strokeColor: 'white',
          strokeWeight: 2,
          scale: 15
        }
      });

      // Add click listener
      marker.addListener('click', () => {
        setSelectedActivity(activity);
        onActivitySelect?.(activity);
        
        // Center map on clicked marker
        googleMapRef.current?.panTo(position);
      });

      markersRef.current.push(marker);
      bounds.extend(position);
    });

    // Include user location in bounds if available
    if (userLocation) {
      bounds.extend({ lat: userLocation.lat, lng: userLocation.lng });
    }

    // Fit map to show all markers
    if (currentDayPlan.activities.length > 0) {
      googleMapRef.current.fitBounds(bounds);
      
      // Ensure minimum zoom level
      const listener = google.maps.event.addListener(googleMapRef.current, 'bounds_changed', () => {
        if (googleMapRef.current!.getZoom()! > 16) {
          googleMapRef.current!.setZoom(16);
        }
        google.maps.event.removeListener(listener);
      });
    }
  }, [mapLoaded, currentDayPlan, selectedDay, userLocation, showRoute]);

  // Get user's current location
  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser');
      toast.error('Geolocation is not supported by this browser');
      return;
    }

    setIsLoadingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location: UserLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        };
        
        setUserLocation(location);
        setIsLoadingLocation(false);
        
        // Add user location marker
        if (googleMapRef.current) {
          // Remove existing user marker
          if (userMarkerRef.current) {
            userMarkerRef.current.setMap(null);
          }
          
          userMarkerRef.current = new google.maps.Marker({
            position: { lat: location.lat, lng: location.lng },
            map: googleMapRef.current,
            title: 'Your Location',
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: '#ef4444',
              fillOpacity: 1,
              strokeColor: 'white',
              strokeWeight: 3,
              scale: 8
            }
          });
          
          // Center map on user location
          googleMapRef.current.panTo({ lat: location.lat, lng: location.lng });
        }
        
        toast.success(`Location found (±${Math.round(location.accuracy || 0)}m accuracy)`);
      },
      (error) => {
        setIsLoadingLocation(false);
        let errorMessage = 'Could not get your location';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location permissions.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }
        
        setLocationError(errorMessage);
        toast.error(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  }, []);

  // Show route between activities
  const toggleRoute = useCallback(() => {
    if (!directionsServiceRef.current || !directionsRendererRef.current || !currentDayPlan?.activities.length) {
      return;
    }

    if (showRoute) {
      // Hide route
      directionsRendererRef.current.setDirections({ routes: [] } as any);
      setShowRoute(false);
      return;
    }

    // Show route
    const activities = currentDayPlan.activities;
    if (activities.length < 2) {
      toast.info('Need at least 2 activities to show route');
      return;
    }

    const waypoints = activities.slice(1, -1).map(activity => ({
      location: { lat: activity.location.latitude, lng: activity.location.longitude },
      stopover: true
    }));

    const request: google.maps.DirectionsRequest = {
      origin: { lat: activities[0].location.latitude, lng: activities[0].location.longitude },
      destination: { 
        lat: activities[activities.length - 1].location.latitude, 
        lng: activities[activities.length - 1].location.longitude 
      },
      waypoints,
      travelMode: google.maps.TravelMode.WALKING,
      optimizeWaypoints: true
    };

    directionsServiceRef.current.route(request, (result, status) => {
      if (status === 'OK' && result) {
        directionsRendererRef.current!.setDirections(result);
        setShowRoute(true);
        toast.success('Route calculated successfully');
      } else {
        toast.error('Could not calculate route');
      }
    });
  }, [showRoute, currentDayPlan]);

  // Navigate to activity from current location
  const navigateToActivity = useCallback((activity: ScheduledActivity) => {
    if (!userLocation) {
      getCurrentLocation();
      return;
    }

    const url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${activity.location.latitude},${activity.location.longitude}`;
    window.open(url, '_blank');
  }, [userLocation, getCurrentLocation]);

  // Open full route in Google Maps
  const openFullRoute = useCallback(() => {
    if (!currentDayPlan?.activities.length) return;
    
    const activities = currentDayPlan.activities;
    
    if (activities.length === 1) {
      const activity = activities[0];
      const url = userLocation 
        ? `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${activity.location.latitude},${activity.location.longitude}`
        : `https://www.google.com/maps/search/?api=1&query=${activity.location.latitude},${activity.location.longitude}`;
      window.open(url, '_blank');
      return;
    }

    // Multi-stop route
    const waypoints = activities.slice(1, -1).map(activity => 
      `${activity.location.latitude},${activity.location.longitude}`
    ).join('|');
    
    const origin = userLocation 
      ? `${userLocation.lat},${userLocation.lng}`
      : `${activities[0].location.latitude},${activities[0].location.longitude}`;
    const destination = `${activities[activities.length - 1].location.latitude},${activities[activities.length - 1].location.longitude}`;
    
    let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
    if (waypoints) {
      url += `&waypoints=${waypoints}`;
    }
    window.open(url, '_blank');
  }, [currentDayPlan, userLocation]);

  // Show fallback if API key is missing
  if (apiKeyMissing) {
    return (
      <MapFallback
        dayPlans={dayPlans}
        selectedDay={selectedDay}
        onDaySelect={onDaySelect}
        onActivitySelect={onActivitySelect}
        reason="no-api-key"
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Day Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {dayPlans.map((_, index) => (
          <Button
            key={index}
            variant={selectedDay === index + 1 ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setSelectedDay(index + 1);
              onDaySelect?.(index + 1);
            }}
            className="whitespace-nowrap"
          >
            Day {index + 1}
          </Button>
        ))}
      </div>

      {/* Location Error Alert */}
      {locationError && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{locationError}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* GPS Map */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Day {selectedDay} GPS Map
              {userLocation && (
                <Badge variant="secondary" className="ml-auto">
                  GPS Active
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              ref={mapRef}
              className="w-full h-80 bg-muted rounded-lg relative overflow-hidden"
            />
            
            <div className="mt-4 flex flex-col gap-2">
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={getCurrentLocation}
                  disabled={isLoadingLocation}
                >
                  {isLoadingLocation ? (
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <Crosshair className="w-4 h-4 mr-2" />
                  )}
                  {userLocation ? 'Update Location' : 'Get My Location'}
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={toggleRoute}
                  disabled={!currentDayPlan?.activities || currentDayPlan.activities.length < 2}
                >
                  <Route className="w-4 h-4 mr-2" />
                  {showRoute ? 'Hide Route' : 'Show Route'}
                </Button>
                
                <Button variant="outline" size="sm" onClick={openFullRoute}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open in Google Maps
                </Button>
              </div>
              
              {userLocation && (
                <p className="text-xs text-muted-foreground">
                  Your location: {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
                  {userLocation.accuracy && ` (±${Math.round(userLocation.accuracy)}m)`}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Activity List */}
        <Card>
          <CardHeader>
            <CardTitle>Day {selectedDay} Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {currentDayPlan?.activities.map((activity, index) => (
                <div
                  key={activity.id}
                  onClick={() => setSelectedActivity(activity)}
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
                      
                      <p className="text-xs text-muted-foreground truncate mb-2">
                        {activity.location.address}
                      </p>
                      
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 px-2 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigateToActivity(activity);
                        }}
                      >
                        <Navigation className="w-3 h-3 mr-1" />
                        Navigate
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

      {/* Selected Activity Details */}
      {selectedActivity && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{selectedActivity.name}</span>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigateToActivity(selectedActivity)}
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  Navigate Here
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${selectedActivity.location.latitude},${selectedActivity.location.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View on Maps
                  </a>
                </Button>
              </div>
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
                  <div className="flex items-center gap-2">
                    <Crosshair className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground text-xs">
                      {selectedActivity.location.latitude.toFixed(6)}, {selectedActivity.location.longitude.toFixed(6)}
                    </span>
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