'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { UserButton, useUser, RedirectToSignIn } from '@clerk/nextjs';
import { ArrowLeft, MapPin, Calendar, Clock, Star, ExternalLink, Edit2, Trash2, Share2, Settings, Map, Download, List } from 'lucide-react';
import Link from 'next/link';
import Logo from '../../../components/Logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { apiService, type Itinerary, type ScheduledActivity, type WeatherForecast } from '@/lib/api';
import DayPlanCard from '@/components/itinerary/DayPlanCard';
import ItineraryMap from '@/components/itinerary/ItineraryMap';

const formatTime = (timeString: string) => {
  const date = new Date(`2000-01-01T${timeString}`);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const ActivityCard = ({ activity }: { activity: ScheduledActivity }) => (
  <Card className="mb-4">
    <CardContent className="p-4">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-lg">{activity.name}</h3>
            {activity.rating && (
              <Badge variant="secondary" className="gap-1">
                <Star size={12} className="fill-current" />
                {activity.rating}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
            <div className="flex items-center gap-1">
              <Clock size={14} />
              {formatTime(activity.startTime)} - {formatTime(activity.endTime)}
            </div>
            <div className="flex items-center gap-1">
              <MapPin size={14} />
              {activity.location.address}
            </div>
          </div>
          {activity.description && (
            <p className="text-sm text-muted-foreground mb-2">{activity.description}</p>
          )}
          <div className="flex items-center gap-2">
            <Badge variant="outline">{activity.category}</Badge>
            {activity.priceRange && (
              <Badge variant="outline">{activity.priceRange}</Badge>
            )}
          </div>
        </div>
        {activity.websiteUrl && (
          <Button variant="ghost" size="sm" asChild>
            <a href={activity.websiteUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink size={16} />
            </a>
          </Button>
        )}
      </div>
    </CardContent>
  </Card>
);

export default function ItineraryPage() {
  const { isLoaded, isSignedIn } = useUser();
  const params = useParams();
  const router = useRouter();
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [weather, setWeather] = useState<WeatherForecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showWeather, setShowWeather] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  const itineraryId = params.id as string;

  useEffect(() => {
    if (isLoaded && isSignedIn && itineraryId) {
      loadItinerary();
    }
  }, [isLoaded, isSignedIn, itineraryId]);

  const loadItinerary = async () => {
    try {
      setLoading(true);
      
      const data = await apiService.getItinerary(itineraryId);
      setItinerary(data);

      // Load weather forecast
      if (showWeather) {
        try {
          const weatherData = await apiService.getWeatherForecast(
            data.destination,
            data.startDate,
            data.endDate
          );
          setWeather(weatherData);
        } catch (weatherError) {
          console.warn('Weather data unavailable:', weatherError);
        }
      }
    } catch (error) {
      console.error('Error loading itinerary:', error);
      setError('Failed to load itinerary');
      toast.error('Failed to load itinerary');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!itinerary || !confirm('Are you sure you want to delete this itinerary?')) {
      return;
    }

    try {
      await apiService.deleteItinerary(itinerary.id);
      toast.success('Itinerary deleted successfully');
      router.push('/dashboard');
    } catch (error) {
      console.error('Error deleting itinerary:', error);
      toast.error('Failed to delete itinerary');
    }
  };

  const handleActivityEdit = (activity: ScheduledActivity) => {
    // TODO: Open activity edit modal
    toast.info('Activity editing coming soon!');
  };

  const handleActivityRemove = async (dayPlanId: string, activityId: string) => {
    if (!confirm('Remove this activity from your itinerary?')) return;

    try {
      await apiService.removeActivity(itinerary!.id, dayPlanId, activityId);
      await loadItinerary(); // Reload to get updated data
      toast.success('Activity removed');
    } catch (error) {
      console.error('Error removing activity:', error);
      toast.error('Failed to remove activity');
    }
  };

  const handleActivityTimeChange = async (dayPlanId: string, activityId: string, startTime: string, endTime: string) => {
    try {
      await apiService.updateActivity(itinerary!.id, dayPlanId, activityId, {
        startTime,
        endTime
      });
      await loadItinerary(); // Reload to get updated data
      toast.success('Activity time updated');
    } catch (error) {
      console.error('Error updating activity time:', error);
      toast.error('Failed to update activity time');
    }
  };

  const handleActivityReorder = async (dayPlanId: string, activityIds: string[]) => {
    try {
      await apiService.reorderActivities(itinerary!.id, dayPlanId, activityIds);
      await loadItinerary(); // Reload to get updated data
      toast.success('Activities reordered');
    } catch (error) {
      console.error('Error reordering activities:', error);
      toast.error('Failed to reorder activities');
    }
  };

  const handleAddActivity = (dayPlanId: string) => {
    // TODO: Open activity search/add modal
    toast.info('Adding activities coming soon!');
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: itinerary?.title,
        text: `Check out my ${itinerary?.destination} itinerary!`,
        url: window.location.href,
      });
    } catch (error) {
      // Fallback to clipboard
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const getTotalActivities = () => {
    return itinerary?.dayPlans.reduce((total, day) => total + day.activities.length, 0) || 0;
  };

  const getTripDuration = () => {
    if (!itinerary) return 0;
    const start = new Date(itinerary.startDate);
    const end = new Date(itinerary.endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Logo size="lg" className="mb-6 justify-center" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return <RedirectToSignIn />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your itinerary...</p>
        </div>
      </div>
    );
  }

  if (error || !itinerary) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">{error || 'Itinerary not found'}</p>
          <Link href="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-background/80 backdrop-blur-xl sticky top-0 z-50 border-b">
        <div className="max-w-screen-xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowLeft size={18} />
                </Button>
              </Link>
              <Logo size="sm" />
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant={viewMode === 'list' ? 'default' : 'ghost'} 
                size="icon"
                onClick={() => setViewMode('list')}
              >
                <List size={18} />
              </Button>
              <Button 
                variant={viewMode === 'map' ? 'default' : 'ghost'} 
                size="icon"
                onClick={() => setViewMode('map')}
              >
                <Map size={18} />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleShare}>
                <Share2 size={18} />
              </Button>
              <Button variant="ghost" size="icon">
                <Download size={18} />
              </Button>
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-medium text-foreground mb-2 tracking-tight">
                {itinerary.title}
              </h1>
              <div className="flex items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{itinerary.destination}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(itinerary.startDate)} - {formatDate(itinerary.endDate)}</span>
                </div>
                <Badge variant="secondary">
                  {getTripDuration()} days • {getTotalActivities()} activities
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-mode"
                  checked={isEditing}
                  onCheckedChange={setIsEditing}
                />
                <Label htmlFor="edit-mode">Edit mode</Label>
              </div>
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="show-weather"
                checked={showWeather}
                onCheckedChange={(checked) => {
                  setShowWeather(checked);
                  if (checked) loadItinerary();
                }}
              />
              <Label htmlFor="show-weather">Show weather</Label>
            </div>
          </div>
        </div>

        {/* Day Plans */}
        {viewMode === 'list' ? (
          <div className="space-y-6">
            {itinerary.dayPlans.map((dayPlan, index) => (
              <DayPlanCard
                key={dayPlan.id}
                dayPlan={dayPlan}
                dayNumber={index + 1}
                weather={weather.find(w => w.date === dayPlan.date)}
                onActivityEdit={isEditing ? handleActivityEdit : undefined}
                onActivityRemove={isEditing ? handleActivityRemove : undefined}
                onActivityTimeChange={isEditing ? handleActivityTimeChange : undefined}
                onActivityReorder={isEditing ? handleActivityReorder : undefined}
                onAddActivity={isEditing ? handleAddActivity : undefined}
                isEditable={isEditing}
              />
            ))}
          </div>
        ) : (
          <ItineraryMap
            dayPlans={itinerary.dayPlans}
            onActivitySelect={(activity) => {
              toast.info(`Selected: ${activity.name}`);
            }}
          />
        )}

        {/* Trip Summary */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Trip Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{getTripDuration()}</div>
                <div className="text-sm text-muted-foreground">Days</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{getTotalActivities()}</div>
                <div className="text-sm text-muted-foreground">Activities</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{itinerary.dayPlans.length}</div>
                <div className="text-sm text-muted-foreground">Planned Days</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {Math.round(getTotalActivities() / getTripDuration() * 10) / 10}
                </div>
                <div className="text-sm text-muted-foreground">Activities/Day</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}