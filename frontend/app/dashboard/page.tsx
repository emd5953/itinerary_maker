'use client';

import { UserButton, useUser, useAuth, RedirectToSignIn } from '@clerk/nextjs';
import { MapPin, Calendar, Users, Plus, Search, Settings, Star, Clock, Heart, DollarSign } from 'lucide-react';
import Link from 'next/link';
import Logo from '../components/Logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiService } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function Dashboard() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { getToken } = useAuth();
  const [userPreferences, setUserPreferences] = useState<any>(null);
  const [itineraries, setItineraries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      loadDashboardData();
    }
  }, [isLoaded, isSignedIn]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      
      // Load user preferences and itineraries in parallel
      const [preferences, userItineraries] = await Promise.all([
        apiService.getUserPreferences(token).catch(() => null),
        apiService.getMyItineraries(token).catch(() => [])
      ]);
      
      setUserPreferences(preferences);
      setItineraries(userItineraries);
    } catch (error) {
      console.warn('Could not load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getDaysBetween = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const getTotalActivities = (itinerary: any) => {
    return itinerary.dayPlans?.reduce((total: number, day: any) => 
      total + (day.activities?.length || 0), 0) || 0;
  };

  const getGradientForDestination = (destination: string) => {
    const gradients = [
      'from-slate-400 to-slate-600',
      'from-stone-400 to-stone-600', 
      'from-zinc-400 to-zinc-600',
      'from-gray-400 to-gray-600',
      'from-neutral-400 to-neutral-600',
      'from-slate-500 to-gray-700'
    ];
    const index = destination.length % gradients.length;
    return gradients[index];
  };

  const getInterestConfig = (interest: string) => {
    const configs: Record<string, { icon: any; bgColor: string; iconColor: string; description: string }> = {
      sights: { icon: MapPin, bgColor: 'bg-slate-100', iconColor: 'text-slate-600', description: 'Landmarks & monuments' },
      food: { icon: Clock, bgColor: 'bg-orange-100', iconColor: 'text-orange-600', description: 'Local cuisine' },
      outdoor: { icon: Calendar, bgColor: 'bg-green-100', iconColor: 'text-green-600', description: 'Nature activities' },
      nightlife: { icon: Star, bgColor: 'bg-indigo-100', iconColor: 'text-indigo-600', description: 'Evening entertainment' },
      shopping: { icon: Heart, bgColor: 'bg-pink-100', iconColor: 'text-pink-600', description: 'Markets & stores' },
      culture: { icon: Users, bgColor: 'bg-violet-100', iconColor: 'text-violet-600', description: 'Museums & arts' },
      adventure: { icon: Plus, bgColor: 'bg-emerald-100', iconColor: 'text-emerald-600', description: 'Thrilling experiences' },
      relaxation: { icon: Settings, bgColor: 'bg-teal-100', iconColor: 'text-teal-600', description: 'Wellness & spa' }
    };
    return configs[interest] || { icon: MapPin, bgColor: 'bg-gray-100', iconColor: 'text-gray-600', description: 'Discover more' };
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

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-background/80 backdrop-blur-xl sticky top-0 z-50 border-b">
        <div className="max-w-screen-xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <Logo size="sm" />
            <div className="flex items-center gap-4">
              <Link href="/dashboard/preferences">
                <Button variant="ghost" size="icon">
                  <Settings size={18} />
                </Button>
              </Link>
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-screen-xl mx-auto px-6 py-16">
        {/* Welcome Section */}
        <div className="mb-16">
          <h1 className="text-4xl font-medium text-foreground mb-4 tracking-tight">
            Hey {user?.firstName || 'there'} 👋
          </h1>
          <p className="text-xl text-muted-foreground">
            {itineraries.length > 0 
              ? `You have ${itineraries.length} trip${itineraries.length === 1 ? '' : 's'} planned. What's next?`
              : "Ready to plan your first adventure?"
            }
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          <Link href="/dashboard/new">
            <Card className="cursor-pointer hover:shadow-md transition-all hover:scale-105">
              <CardContent className="p-6">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                  <Plus size={20} className="text-emerald-600" />
                </div>
                <CardTitle className="text-lg mb-2">New trip</CardTitle>
                <CardDescription>Start planning your next adventure</CardDescription>
              </CardContent>
            </Card>
          </Link>

          <Card className="cursor-pointer hover:shadow-md transition-all hover:scale-105 opacity-75">
            <CardContent className="p-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Search size={20} className="text-blue-600" />
              </div>
              <CardTitle className="text-lg mb-2">Browse ideas</CardTitle>
              <CardDescription>Discover popular destinations</CardDescription>
              <Badge variant="secondary" className="mt-2">Coming soon</Badge>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-all hover:scale-105 opacity-75">
            <CardContent className="p-6">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                <Users size={20} className="text-amber-600" />
              </div>
              <CardTitle className="text-lg mb-2">Join trip</CardTitle>
              <CardDescription>Collaborate with friends</CardDescription>
              <Badge variant="secondary" className="mt-2">Coming soon</Badge>
            </CardContent>
          </Card>
        </div>

        {/* Stats Section */}
        {!loading && itineraries.length > 0 && (
          <div className="grid md:grid-cols-4 gap-4 mb-12">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <MapPin size={16} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold">{itineraries.length}</p>
                    <p className="text-sm text-muted-foreground">Trips planned</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar size={16} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold">
                      {itineraries.reduce((total, itinerary) => 
                        total + getDaysBetween(itinerary.startDate, itinerary.endDate), 0)}
                    </p>
                    <p className="text-sm text-muted-foreground">Total days</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Clock size={16} className="text-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold">
                      {itineraries.reduce((total, itinerary) => total + getTotalActivities(itinerary), 0)}
                    </p>
                    <p className="text-sm text-muted-foreground">Activities</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Star size={16} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold">
                      {new Set(itineraries.map(i => i.destination.toLowerCase())).size}
                    </p>
                    <p className="text-sm text-muted-foreground">Destinations</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recent Trips */}
        <div className="mb-20">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-medium text-foreground">Your trips</h2>
            <Button className="gap-2" asChild>
              <Link href="/dashboard/new">
                <Plus size={16} />
                New trip
              </Link>
            </Button>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="h-32 bg-muted animate-pulse" />
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded animate-pulse" />
                      <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : itineraries.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {itineraries.slice(0, 6).map((itinerary) => {
                const isUpcoming = new Date(itinerary.startDate) > new Date();
                return (
                  <Link key={itinerary.id} href={`/dashboard/itinerary/${itinerary.id}`}>
                    <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                      <div className={`h-32 bg-gradient-to-br ${getGradientForDestination(itinerary.destination)} relative`}>
                        <div className="absolute bottom-4 left-4 text-white">
                          <h3 className="font-medium mb-1">{itinerary.destination}</h3>
                          <p className="text-sm opacity-90">
                            {formatDate(itinerary.startDate)} - {formatDate(itinerary.endDate)}
                          </p>
                        </div>
                        {isUpcoming && (
                          <div className="absolute top-4 right-4">
                            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                              Upcoming
                            </Badge>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4 text-muted-foreground mb-4 text-sm">
                          <Badge variant="secondary" className="gap-1">
                            <Calendar size={12} />
                            {getDaysBetween(itinerary.startDate, itinerary.endDate)} days
                          </Badge>
                          <Badge variant="secondary" className="gap-1">
                            <MapPin size={12} />
                            {getTotalActivities(itinerary)} stops
                          </Badge>
                        </div>
                        <Button variant="secondary" size="sm" className="w-full">
                          {isUpcoming ? 'View & Prepare' : 'View Trip'}
                        </Button>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}

              {/* Show "Create First Trip" card if less than 6 trips */}
              {itineraries.length < 6 && (
                <Card className="border-dashed border-2 border-muted">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Plus size={20} className="text-muted-foreground" />
                    </div>
                    <CardTitle className="text-base mb-2">Plan another trip</CardTitle>
                    <CardDescription className="mb-4">The world is waiting</CardDescription>
                    <Button size="sm" variant="outline" asChild>
                      <Link href="/dashboard/new">Start planning</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            // Empty state when no trips
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mx-auto mb-6">
                <MapPin size={24} className="text-muted-foreground" />
              </div>
              <h3 className="text-xl font-medium mb-2">No trips yet</h3>
              <p className="text-muted-foreground mb-6">Start planning your first adventure!</p>
              <Button variant="outline" asChild>
                <Link href="/dashboard/new">
                  <Plus size={16} className="mr-2" />
                  Create your first trip
                </Link>
              </Button>
            </div>
          )}
        </div>

        {/* Personalized Recommendations */}
        <div>
          <h2 className="text-2xl font-medium text-foreground mb-6">
            {userPreferences?.interests?.length > 0 ? 'Recommended for you' : 'Popular right now'}
          </h2>
          
          {userPreferences?.interests?.length > 0 && (
            <p className="text-muted-foreground mb-6">
              Based on your interests: {userPreferences.interests.slice(0, 3).join(', ')}
              {userPreferences.interests.length > 3 && ` and ${userPreferences.interests.length - 3} more`}
            </p>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {userPreferences?.interests?.length > 0 ? (
              // Show personalized recommendations based on user interests
              userPreferences.interests.slice(0, 4).map((interest: string, index: number) => {
                const interestConfig = getInterestConfig(interest);
                const IconComponent = interestConfig.icon;
                return (
                  <Card key={interest} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className={`w-8 h-8 ${interestConfig.bgColor} rounded-lg flex items-center justify-center mb-3`}>
                        <IconComponent size={16} className={interestConfig.iconColor} />
                      </div>
                      <CardTitle className="text-base mb-1 capitalize">{interest}</CardTitle>
                      <CardDescription className="text-sm">{interestConfig.description}</CardDescription>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              // Default recommendations for users without preferences
              <>
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center mb-3">
                      <Star size={16} className="text-slate-600" />
                    </div>
                    <CardTitle className="text-base mb-1">Museums</CardTitle>
                    <CardDescription className="text-sm">Art & culture</CardDescription>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                      <MapPin size={16} className="text-green-600" />
                    </div>
                    <CardTitle className="text-base mb-1">Nature</CardTitle>
                    <CardDescription className="text-sm">Outdoor spots</CardDescription>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mb-3">
                      <Clock size={16} className="text-orange-600" />
                    </div>
                    <CardTitle className="text-base mb-1">Food</CardTitle>
                    <CardDescription className="text-sm">Local eats</CardDescription>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mb-3">
                      <Calendar size={16} className="text-indigo-600" />
                    </div>
                    <CardTitle className="text-base mb-1">Nightlife</CardTitle>
                    <CardDescription className="text-sm">After dark</CardDescription>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Preferences CTA */}
          {!userPreferences?.interests?.length && (
            <div className="mt-8 p-6 bg-slate-50 rounded-lg text-center border border-slate-200">
              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Heart size={16} className="text-slate-600" />
              </div>
              <h3 className="font-medium mb-2">Get personalized recommendations</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Tell us what you love and we'll suggest perfect activities for your trips
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/preferences">
                  <Settings className="w-4 h-4 mr-2" />
                  Set your preferences
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}