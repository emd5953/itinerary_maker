'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { UserButton, useUser, RedirectToSignIn } from '@clerk/nextjs';
import { ArrowLeft, MapPin, Calendar, Clock, Star, ExternalLink, Edit2, Trash2, Share2 } from 'lucide-react';
import Link from 'next/link';
import Logo from '../../../components/Logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface ScheduledActivity {
  id: string;
  name: string;
  description?: string;
  category: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
    city?: string;
    country?: string;
    placeId?: string;
  };
  startTime: string;
  endTime: string;
  estimatedDuration?: number;
  websiteUrl?: string;
  rating?: number;
  priceRange?: string;
  tags?: string[];
}

interface DayPlan {
  id: string;
  date: string;
  activities: ScheduledActivity[];
  notes?: string;
}

interface User {
  id: string;
  clerkId: string;
  email: string;
  name: string;
  profilePicture?: string;
}

interface Itinerary {
  id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  owner: User;
  dayPlans: DayPlan[];
  settings?: any;
  createdAt: string;
  updatedAt: string;
}

export default function ItineraryPage() {
  const { isLoaded, isSignedIn } = useUser();
  const params = useParams();
  const router = useRouter();
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const itineraryId = params.id as string;

  useEffect(() => {
    if (isLoaded && isSignedIn && itineraryId) {
      loadItinerary();
    }
  }, [isLoaded, isSignedIn, itineraryId]);

  const loadItinerary = async () => {
    try {
      setLoading(true);
      
      // Simplified API call without authentication
      const response = await fetch(`http://localhost:8080/api/itineraries/${itineraryId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setItinerary(data);
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
      const response = await fetch(`http://localhost:8080/api/itineraries/${itinerary.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      toast.success('Itinerary deleted successfully');
      router.push('/dashboard');
    } catch (error) {
      console.error('Error deleting itinerary:', error);
      toast.error('Failed to delete itinerary');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    // Handle both HH:mm:ss and HH:mm formats
    const timePart = timeString.substring(0, 5); // "10:00:00" -> "10:00"
    const [hours, minutes] = timePart.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
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
      <div className="min-h-screen bg-background">
        <nav className="bg-background/80 backdrop-blur-xl sticky top-0 z-50 border-b">
          <div className="max-w-screen-xl mx-auto px-6">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                  <Link href="/dashboard">
                    <ArrowLeft size={18} />
                  </Link>
                </Button>
                <Logo size="sm" />
              </div>
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </nav>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-muted-foreground">Loading itinerary...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !itinerary) {
    return (
      <div className="min-h-screen bg-background">
        <nav className="bg-background/80 backdrop-blur-xl sticky top-0 z-50 border-b">
          <div className="max-w-screen-xl mx-auto px-6">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                  <Link href="/dashboard">
                    <ArrowLeft size={18} />
                  </Link>
                </Button>
                <Logo size="sm" />
              </div>
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </nav>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <h1 className="text-2xl font-medium mb-4">Itinerary not found</h1>
            <p className="text-muted-foreground mb-6">The itinerary you're looking for doesn't exist or you don't have access to it.</p>
            <Button asChild>
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </div>
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
              <Button variant="ghost" size="icon" asChild>
                <Link href="/dashboard">
                  <ArrowLeft size={18} />
                </Link>
              </Button>
              <Logo size="sm" />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Share2 size={18} />
              </Button>
              <Button variant="ghost" size="icon">
                <Edit2 size={18} />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleDelete}>
                <Trash2 size={18} />
              </Button>
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-medium text-foreground mb-4 tracking-tight">
            {itinerary.title}
          </h1>
          <div className="flex items-center gap-6 text-muted-foreground">
            <div className="flex items-center gap-2">
              <MapPin size={18} />
              <span>{itinerary.destination}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={18} />
              <span>
                {formatDate(itinerary.startDate)} - {formatDate(itinerary.endDate)}
              </span>
            </div>
            <Badge variant="secondary">
              {itinerary.dayPlans.length} {itinerary.dayPlans.length === 1 ? 'day' : 'days'}
            </Badge>
          </div>
        </div>

        {/* Day Plans */}
        <div className="space-y-12">
          {itinerary.dayPlans.map((dayPlan, index) => (
            <div key={dayPlan.id}>
              <div className="mb-6">
                <h2 className="text-2xl font-medium text-foreground mb-2">
                  Day {index + 1}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {formatDate(dayPlan.date)}
                </p>
                {dayPlan.notes && (
                  <p className="text-muted-foreground mt-2">{dayPlan.notes}</p>
                )}
              </div>

              <div className="space-y-4">
                {dayPlan.activities.map((activity) => (
                  <ActivityCard key={activity.id} activity={activity} />
                ))}
              </div>

              {index < itinerary.dayPlans.length - 1 && (
                <Separator className="mt-12" />
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-16 flex justify-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/dashboard/new">Create Another Trip</Link>
          </Button>
          <Button>
            Share Itinerary
          </Button>
        </div>
      </div>
    </div>
  );
}