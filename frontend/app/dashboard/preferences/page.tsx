'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserButton, useUser, useAuth, RedirectToSignIn } from '@clerk/nextjs';
import { ArrowLeft, Save, Heart, DollarSign, Clock, Utensils, Car } from 'lucide-react';
import Link from 'next/link';
import Logo from '../../components/Logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { apiService } from '@/lib/api';

const INTERESTS = [
  { id: 'sights', label: 'Sights & Landmarks', icon: '�️' },
  { id: 'food', label: 'Food & Dining', icon: '🍽️' },
  { id: 'outdoor', label: 'Outdoor Activities', icon: '�️' },
  { id: 'nightlife', label: 'Nightlife & Entertainment', icon: '🌃' },
  { id: 'shopping', label: 'Shopping', icon: '🛍️' },
  { id: 'culture', label: 'Museums & Culture', icon: '�' },
  { id: 'adventure', label: 'Adventure Sports', icon: '🏔️' },
  { id: 'relaxation', label: 'Spa & Wellness', icon: '🧘' },
];

const BUDGET_LEVELS = [
  { id: 'BUDGET', label: 'Budget', description: 'Free and $ activities', icon: '�' },
  { id: 'MID_RANGE', label: 'Mid-Range', description: 'Balanced mix of $ and $$', icon: '💳' },
  { id: 'LUXURY', label: 'Luxury', description: '$$ and $$$ experiences', icon: '💎' },
];

const TRAVEL_STYLES = [
  { id: 'RELAXED', label: 'Relaxed', description: '3-4 activities per day', icon: '🌴' },
  { id: 'MODERATE', label: 'Moderate', description: '4-5 activities per day', icon: '🚶' },
  { id: 'PACKED', label: 'Packed', description: '6+ activities per day', icon: '🏃' },
];

const DIETARY_RESTRICTIONS = [
  { id: 'vegetarian', label: 'Vegetarian', icon: '🥗' },
  { id: 'vegan', label: 'Vegan', icon: '🌱' },
  { id: 'gluten_free', label: 'Gluten-Free', icon: '🌾' },
  { id: 'halal', label: 'Halal', icon: '🕌' },
  { id: 'kosher', label: 'Kosher', icon: '✡️' },
  { id: 'dairy_free', label: 'Dairy-Free', icon: '🥛' },
];

const TRANSPORT_OPTIONS = [
  { id: 'walking', label: 'Walking', icon: '🚶' },
  { id: 'public_transport', label: 'Public Transport', icon: '🚇' },
  { id: 'car', label: 'Car/Taxi', icon: '�,' },
  { id: 'bike', label: 'Bike', icon: '�' },
  { id: 'MIXED', label: 'Mixed', icon: '🚌' },
];

export default function PreferencesPage() {
  const { isLoaded, isSignedIn } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState({
    interests: [] as string[],
    budgetLevel: 'MID_RANGE',
    travelStyle: 'MODERATE',
    dietaryRestrictions: [] as string[],
    preferredTransport: 'MIXED',
  });

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      loadUserPreferences();
    }
  }, [isLoaded, isSignedIn]);

  const loadUserPreferences = async () => {
    try {
      const token = await getToken();
      const userPrefs = await apiService.getUserPreferences(token);
      if (userPrefs) {
        setPreferences({
          interests: userPrefs.interests || [],
          budgetLevel: userPrefs.budgetLevel || 'MID_RANGE',
          travelStyle: userPrefs.travelStyle || 'MODERATE',
          dietaryRestrictions: userPrefs.dietaryRestrictions || [],
          preferredTransport: userPrefs.preferredTransport || 'MIXED',
        });
      }
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

  const toggleInterest = (interestId: string) => {
    setPreferences(prev => ({
      ...prev,
      interests: prev.interests.includes(interestId)
        ? prev.interests.filter(id => id !== interestId)
        : [...prev.interests, interestId]
    }));
  };

  const toggleDietaryRestriction = (restrictionId: string) => {
    setPreferences(prev => ({
      ...prev,
      dietaryRestrictions: prev.dietaryRestrictions.includes(restrictionId)
        ? prev.dietaryRestrictions.filter(id => id !== restrictionId)
        : [...prev.dietaryRestrictions, restrictionId]
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = await getToken();
      await apiService.updateUserPreferences(preferences, token);
      toast.success('Preferences saved successfully!');
      router.push('/dashboard');
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

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
            <UserButton />
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="mb-8">
          <h1 className="text-3xl font-medium text-foreground mb-2 tracking-tight">
            Travel Preferences
          </h1>
          <p className="text-muted-foreground">
            Help us personalize your travel recommendations by sharing your preferences.
          </p>
        </div>

        <div className="space-y-8">
          {/* Interests */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-primary" />
                What interests you?
              </CardTitle>
              <CardDescription>
                Select all the activities and experiences you enjoy during travel.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {INTERESTS.map((interest) => (
                  <button
                    key={interest.id}
                    onClick={() => toggleInterest(interest.id)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      preferences.interests.includes(interest.id)
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="text-2xl mb-2">{interest.icon}</div>
                    <div className="text-sm font-medium">{interest.label}</div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Budget Level */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                Budget Level
              </CardTitle>
              <CardDescription>
                What's your typical spending range for activities and dining?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {BUDGET_LEVELS.map((budget) => (
                  <button
                    key={budget.id}
                    onClick={() => setPreferences(prev => ({ ...prev, budgetLevel: budget.id }))}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      preferences.budgetLevel === budget.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="text-2xl mb-2">{budget.icon}</div>
                    <div className="text-sm font-medium mb-1">{budget.label}</div>
                    <div className="text-xs text-muted-foreground">{budget.description}</div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Travel Style */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Travel Style
              </CardTitle>
              <CardDescription>
                How do you prefer to pace your trips?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {TRAVEL_STYLES.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setPreferences(prev => ({ ...prev, travelStyle: style.id }))}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      preferences.travelStyle === style.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="text-2xl mb-2">{style.icon}</div>
                    <div className="text-sm font-medium mb-1">{style.label}</div>
                    <div className="text-xs text-muted-foreground">{style.description}</div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Dietary Restrictions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Utensils className="w-5 h-5 text-primary" />
                Dietary Preferences
              </CardTitle>
              <CardDescription>
                Any dietary restrictions or preferences we should know about?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {DIETARY_RESTRICTIONS.map((restriction) => (
                  <button
                    key={restriction.id}
                    onClick={() => toggleDietaryRestriction(restriction.id)}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      preferences.dietaryRestrictions.includes(restriction.id)
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="text-lg mb-1">{restriction.icon}</div>
                    <div className="text-sm font-medium">{restriction.label}</div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Preferred Transport */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="w-5 h-5 text-primary" />
                Preferred Transportation
              </CardTitle>
              <CardDescription>
                How do you like to get around when exploring a destination?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {TRANSPORT_OPTIONS.map((transport) => (
                  <button
                    key={transport.id}
                    onClick={() => setPreferences(prev => ({ ...prev, preferredTransport: transport.id }))}
                    className={`p-3 rounded-lg border-2 transition-all text-center ${
                      preferences.preferredTransport === transport.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="text-lg mb-1">{transport.icon}</div>
                    <div className="text-sm font-medium">{transport.label}</div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving} size="lg">
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Preferences
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}