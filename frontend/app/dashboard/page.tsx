'use client';

import { UserButton, useUser, RedirectToSignIn } from '@clerk/nextjs';
import { MapPin, Calendar, Users, Plus, Search, Settings, Star, Clock } from 'lucide-react';
import Logo from '../components/Logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function Dashboard() {
  const { isLoaded, isSignedIn, user } = useUser();

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
              <Button variant="ghost" size="icon">
                <Settings size={18} />
              </Button>
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
          <p className="text-xl text-muted-foreground">What's the next trip?</p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                <Plus size={20} className="text-emerald-600" />
              </div>
              <CardTitle className="text-lg mb-2">New trip</CardTitle>
              <CardDescription>Start from scratch</CardDescription>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Search size={20} className="text-blue-600" />
              </div>
              <CardTitle className="text-lg mb-2">Browse ideas</CardTitle>
              <CardDescription>Get inspired</CardDescription>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                <Users size={20} className="text-amber-600" />
              </div>
              <CardTitle className="text-lg mb-2">Join trip</CardTitle>
              <CardDescription>Someone invited you</CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Recent Trips */}
        <div className="mb-20">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-medium text-foreground">Your trips</h2>
            <Button className="gap-2">
              <Plus size={16} />
              New trip
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Sample Trip Cards */}
            <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
              <div className="h-32 bg-gradient-to-br from-emerald-400 to-blue-500 relative">
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="font-medium mb-1">Tokyo</h3>
                  <p className="text-sm opacity-90">Mar 15-22</p>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex items-center gap-4 text-muted-foreground mb-4 text-sm">
                  <Badge variant="secondary" className="gap-1">
                    <Calendar size={12} />
                    7 days
                  </Badge>
                  <Badge variant="secondary" className="gap-1">
                    <MapPin size={12} />
                    12 stops
                  </Badge>
                </div>
                <Button variant="secondary" size="sm" className="w-full">
                  Open
                </Button>
              </CardContent>
            </Card>

            <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
              <div className="h-32 bg-gradient-to-br from-amber-400 to-orange-500 relative">
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="font-medium mb-1">Paris</h3>
                  <p className="text-sm opacity-90">Apr 5-10</p>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex items-center gap-4 text-muted-foreground mb-4 text-sm">
                  <Badge variant="secondary" className="gap-1">
                    <Calendar size={12} />
                    5 days
                  </Badge>
                  <Badge variant="secondary" className="gap-1">
                    <MapPin size={12} />
                    8 stops
                  </Badge>
                </div>
                <Button variant="secondary" size="sm" className="w-full">
                  Open
                </Button>
              </CardContent>
            </Card>

            {/* Empty State */}
            <Card className="border-dashed border-2">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Plus size={20} className="text-muted-foreground" />
                </div>
                <CardTitle className="text-base mb-2">Your first trip</CardTitle>
                <CardDescription className="mb-4">Let's plan something</CardDescription>
                <Button size="sm">Start</Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recommendations */}
        <div>
          <h2 className="text-2xl font-medium text-foreground mb-6">Popular right now</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mb-3">
                  <Star size={16} className="text-red-600" />
                </div>
                <CardTitle className="text-base mb-1">Museums</CardTitle>
                <CardDescription className="text-sm">Art & culture</CardDescription>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center mb-3">
                  <MapPin size={16} className="text-emerald-600" />
                </div>
                <CardTitle className="text-base mb-1">Nature</CardTitle>
                <CardDescription className="text-sm">Outdoor spots</CardDescription>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center mb-3">
                  <Users size={16} className="text-amber-600" />
                </div>
                <CardTitle className="text-base mb-1">Food</CardTitle>
                <CardDescription className="text-sm">Local eats</CardDescription>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                  <Clock size={16} className="text-blue-600" />
                </div>
                <CardTitle className="text-base mb-1">Nightlife</CardTitle>
                <CardDescription className="text-sm">After dark</CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}