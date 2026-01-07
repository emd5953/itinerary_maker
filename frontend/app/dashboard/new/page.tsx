'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserButton, useUser, useAuth, RedirectToSignIn } from '@clerk/nextjs';
import { ArrowLeft, MapPin, Calendar, Loader2, Settings, Heart, DollarSign, Clock } from 'lucide-react';
import Link from 'next/link';
import Logo from '../../components/Logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { apiService, GenerateItineraryRequest } from '@/lib/api';
import { toast } from 'sonner';

export default function NewTrip() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [userPreferences, setUserPreferences] = useState<any>(null);
  const [formData, setFormData] = useState({
    destination: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      loadUserPreferences();
    }
  }, [isLoaded, isSignedIn]);

  const loadUserPreferences = async () => {
    try {
      const token = await getToken();
      const preferences = await apiService.getUserPreferences(token);
      setUserPreferences(preferences);
    } catch (error) {
      console.warn('Could not load user preferences:', error);
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.destination || !formData.startDate || !formData.endDate) {
      toast.error('Please fill in all fields');
      return;
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      toast.error('End date must be after start date');
      return;
    }

    setIsGenerating(true);

    try {
      const token = await getToken();
      const itinerary = await apiService.generateItinerary({
        destination: formData.destination,
        startDate: formData.startDate,
        endDate: formData.endDate,
      }, token);
      
      toast.success('Itinerary generated successfully!');
      router.push(`/dashboard/itinerary/${itinerary.id}`);
    } catch (error) {
      console.error('Error generating itinerary:', error);
      toast.error('Failed to generate itinerary. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

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
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-medium text-foreground mb-4 tracking-tight">
            Plan your trip
          </h1>
          <p className="text-xl text-muted-foreground">
            Tell us where you want to go and we'll create a personalized itinerary
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Trip Details Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin size={20} />
                  Trip Details
                </CardTitle>
                <CardDescription>
                  We'll use this information to create your perfect itinerary
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="destination">Destination</Label>
                    <Input
                      id="destination"
                      placeholder="e.g., Paris, Tokyo, New York"
                      value={formData.destination}
                      onChange={(e) => handleInputChange('destination', e.target.value)}
                      disabled={isGenerating}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => handleInputChange('startDate', e.target.value)}
                        disabled={isGenerating}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => handleInputChange('endDate', e.target.value)}
                        disabled={isGenerating}
                        min={formData.startDate || new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button 
                      type="submit" 
                      className="w-full" 
                      size="lg"
                      disabled={isGenerating}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 size={20} className="animate-spin mr-2" />
                          Generating your itinerary...
                        </>
                      ) : (
                        <>
                          <Calendar size={20} className="mr-2" />
                          Generate Itinerary
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Preview Section */}
            <div className="mt-8">
              <h3 className="text-lg font-medium text-foreground mb-4">What you'll get:</h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <MapPin size={16} className="text-emerald-600" />
                  </div>
                  <p className="font-medium mb-1">Smart recommendations</p>
                  <p className="text-muted-foreground">Top-rated attractions and hidden gems</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Calendar size={16} className="text-blue-600" />
                  </div>
                  <p className="font-medium mb-1">Optimized schedule</p>
                  <p className="text-muted-foreground">Perfectly timed day-by-day plans</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Loader2 size={16} className="text-amber-600" />
                  </div>
                  <p className="font-medium mb-1">Real-time data</p>
                  <p className="text-muted-foreground">Live ratings and current information</p>
                </div>
              </div>
            </div>
          </div>

          {/* User Preferences Sidebar */}
          <div className="space-y-6">
            {userPreferences ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="w-5 h-5 text-primary" />
                      Your Preferences
                    </CardTitle>
                    <CardDescription>
                      We'll use these to personalize your itinerary.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Interests</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {userPreferences.interests.map((interest: string) => (
                          <Badge key={interest} variant="secondary" className="text-xs">
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        Budget Level
                      </Label>
                      <Badge variant="outline" className="mt-1">
                        {userPreferences.budgetLevel.replace('_', ' ').toLowerCase()}
                      </Badge>
                    </div>

                    <div>
                      <Label className="text-sm font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Travel Style
                      </Label>
                      <Badge variant="outline" className="mt-1">
                        {userPreferences.travelStyle.toLowerCase()}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <Settings className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-3">
                        Want to update your preferences?
                      </p>
                      <Link href="/dashboard/preferences">
                        <Button variant="outline" size="sm">
                          Edit Preferences
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Heart className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-3">
                      Set up your preferences to get personalized recommendations.
                    </p>
                    <Link href="/dashboard/preferences">
                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4 mr-2" />
                        Set Preferences
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}