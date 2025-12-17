'use client';

import { SignInButton, SignUpButton, useUser } from '@clerk/nextjs';
import { MapPin, Calendar, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Logo from './components/Logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function Home() {
  const { isSignedIn } = useUser();

  if (isSignedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Logo size="xl" className="mb-12 justify-center" />
          <h1 className="text-4xl font-semibold text-foreground mb-8">Welcome back</h1>
          <Button asChild size="lg">
            <Link href="/dashboard" className="gap-2">
              Continue to Dashboard <ArrowRight size={20} />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b">
        <div className="max-w-screen-xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <Logo size="sm" />
            <div className="flex items-center gap-4">
              <SignInButton mode="modal">
                <Button variant="ghost" size="sm">
                  Sign in
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button size="sm">
                  Try free
                </Button>
              </SignUpButton>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16">
        <div className="max-w-screen-xl mx-auto px-6">
          <div className="text-center pt-16 pb-20">
            <h1 className="text-6xl md:text-7xl font-medium text-foreground mb-6 tracking-tight leading-none">
              Travel planning
              <br />
              that actually works
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Build itineraries with your friends. No more endless group chats or forgotten suggestions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <SignUpButton mode="modal">
                <Button size="lg" className="text-lg px-8">
                  Try it free
                </Button>
              </SignUpButton>
              <Button variant="ghost" size="lg" className="text-lg">
                See how it works →
              </Button>
            </div>
          </div>
          {/* Product Preview */}
          <div className="relative mx-auto max-w-5xl">
            <Card className="overflow-hidden">
              <CardContent className="p-12">
                <Card className="w-full max-w-md mx-auto">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Tokyo Trip</CardTitle>
                      <div className="flex gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <MapPin size={16} className="text-emerald-600" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">Senso-ji Temple</div>
                        <div className="text-muted-foreground text-xs">9:00 AM</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Calendar size={16} className="text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">Tsukiji Market</div>
                        <div className="text-muted-foreground text-xs">12:00 PM</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-screen-xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-medium text-foreground mb-4 tracking-tight">
              Built for real travelers
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              The tools you actually need, without the fluff.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-6">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <Users size={24} className="text-emerald-600" />
                </div>
                <CardTitle className="text-xl mb-4">Group planning</CardTitle>
                <CardDescription className="text-base">
                  Everyone adds ideas. Vote on what makes the cut. No more decision paralysis.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="text-center p-6">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <MapPin size={24} className="text-blue-600" />
                </div>
                <CardTitle className="text-xl mb-4">Smart scheduling</CardTitle>
                <CardDescription className="text-base">
                  We handle the logistics. Opening hours, travel time, realistic pacing.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="text-center p-6">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <Calendar size={24} className="text-amber-600" />
                </div>
                <CardTitle className="text-xl mb-4">Export anywhere</CardTitle>
                <CardDescription className="text-base">
                  Google Calendar, Apple Calendar, or a clean PDF. Your choice.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-background">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-4xl font-medium text-foreground mb-6 tracking-tight">
            Start your next trip
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Free to try. No credit card required.
          </p>
          <SignUpButton mode="modal">
            <Button size="lg" className="text-lg px-8">
              Sign up free
            </Button>
          </SignUpButton>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/50 py-12">
        <div className="max-w-screen-xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <Logo size="sm" className="mb-4 md:mb-0" />
            <div className="flex gap-8 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors">Help</a>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
            <p className="text-sm">&copy; 2024 aSpot</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
