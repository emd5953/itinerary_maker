'use client';

import { useState, useEffect } from 'react';
import { Search, MapPin, Star, Clock, Plus, X, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { apiService, type Activity } from '@/lib/api';
import { toast } from 'sonner';

interface ActivitySearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  destination: string;
  onSelectActivity: (activity: Activity, startTime: string, endTime: string) => void;
  suggestedStartTime?: string;
}

const ACTIVITY_CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'sights', label: 'Sights & Landmarks' },
  { value: 'food', label: 'Food & Dining' },
  { value: 'outdoor', label: 'Outdoor Activities' },
  { value: 'culture', label: 'Arts & Culture' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'nightlife', label: 'Nightlife' },
  { value: 'entertainment', label: 'Entertainment' },
];

const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
  '20:00', '20:30', '21:00', '21:30', '22:00'
];

export default function ActivitySearchModal({
  isOpen,
  onClose,
  destination,
  onSelectActivity,
  suggestedStartTime = '10:00'
}: ActivitySearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchMode, setSearchMode] = useState<'category' | 'query' | 'popular'>('popular');
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [startTime, setStartTime] = useState(suggestedStartTime);
  const [endTime, setEndTime] = useState('');

  // Calculate end time based on activity type and start time
  const calculateEndTime = (activity: Activity, start: string) => {
    const startHour = parseInt(start.split(':')[0]);
    const startMinute = parseInt(start.split(':')[1]);
    
    // Default durations by category (in hours)
    const durations: Record<string, number> = {
      'food': 1.5,
      'sights': 2,
      'culture': 2.5,
      'outdoor': 3,
      'shopping': 2,
      'nightlife': 3,
      'entertainment': 2.5
    };
    
    const duration = durations[activity.category?.toLowerCase()] || 2;
    const endHour = startHour + Math.floor(duration);
    const endMinute = startMinute + ((duration % 1) * 60);
    
    const finalEndHour = endHour + Math.floor(endMinute / 60);
    const finalEndMinute = endMinute % 60;
    
    return `${finalEndHour.toString().padStart(2, '0')}:${finalEndMinute.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (isOpen) {
      loadPopularActivities();
    }
  }, [isOpen, destination]);

  useEffect(() => {
    if (selectedActivity && startTime) {
      setEndTime(calculateEndTime(selectedActivity, startTime));
    }
  }, [selectedActivity, startTime]);

  const loadPopularActivities = async () => {
    try {
      setLoading(true);
      const data = await apiService.getPopularActivities(destination, 20);
      setActivities(data);
      setSearchMode('popular');
    } catch (error) {
      console.error('Error loading popular activities:', error);
      toast.error('Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  const searchByCategory = async () => {
    if (!selectedCategory) return;
    
    try {
      setLoading(true);
      const data = await apiService.searchActivities(destination, selectedCategory, 20);
      setActivities(data);
      setSearchMode('category');
    } catch (error) {
      console.error('Error searching activities by category:', error);
      toast.error('Failed to search activities');
    } finally {
      setLoading(false);
    }
  };

  const searchByQuery = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      setLoading(true);
      const data = await apiService.searchActivitiesByQuery(searchQuery, 0, 20);
      setActivities(data.content);
      setSearchMode('query');
    } catch (error) {
      console.error('Error searching activities by query:', error);
      toast.error('Failed to search activities');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      searchByQuery();
    } else if (selectedCategory) {
      searchByCategory();
    } else {
      loadPopularActivities();
    }
  };

  const handleActivitySelect = (activity: Activity) => {
    setSelectedActivity(activity);
    if (!endTime) {
      setEndTime(calculateEndTime(activity, startTime));
    }
  };

  const handleAddActivity = () => {
    if (!selectedActivity || !startTime || !endTime) {
      toast.error('Please select an activity and set times');
      return;
    }

    onSelectActivity(selectedActivity, startTime, endTime);
    onClose();
    
    // Reset state
    setSelectedActivity(null);
    setStartTime(suggestedStartTime);
    setEndTime('');
    setSearchQuery('');
    setSelectedCategory('');
  };

  const formatRating = (rating?: number) => {
    if (!rating) return 'No rating';
    return rating.toFixed(1);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add Activity to {destination}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          {/* Search Controls */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search activities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {ACTIVITY_CATEGORIES.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleSearch} disabled={loading}>
              <Filter className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>

          {/* Results */}
          <div className="flex-1 overflow-hidden flex gap-4">
            {/* Activity List */}
            <div className="flex-1 overflow-y-auto">
              <div className="space-y-2">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : activities.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No activities found. Try a different search.
                  </div>
                ) : (
                  activities.map((activity) => (
                    <Card
                      key={activity.id}
                      className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                        selectedActivity?.id === activity.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => handleActivitySelect(activity)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex-1">
                            <h3 className="font-medium text-sm mb-1">{activity.name}</h3>
                            {activity.description && (
                              <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                                {activity.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <MapPin className="w-3 h-3" />
                              <span className="truncate">{activity.location.address}</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            {activity.rating && (
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                <span className="text-xs font-medium">{formatRating(activity.rating)}</span>
                              </div>
                            )}
                            {activity.category && (
                              <Badge variant="secondary" className="text-xs">
                                {activity.category}
                              </Badge>
                            )}
                            {activity.priceRange && (
                              <Badge variant="outline" className="text-xs">
                                {activity.priceRange}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>

            {/* Time Selection */}
            {selectedActivity && (
              <div className="w-80 border-l pl-4">
                <div className="sticky top-0">
                  <h3 className="font-medium mb-4">Schedule Activity</h3>
                  
                  <div className="space-y-4">
                    <div className="p-3 bg-muted rounded-lg">
                      <h4 className="font-medium text-sm mb-1">{selectedActivity.name}</h4>
                      <p className="text-xs text-muted-foreground">{selectedActivity.location.address}</p>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="start-time" className="text-sm">Start Time</Label>
                        <Select value={startTime} onValueChange={setStartTime}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TIME_SLOTS.map((time) => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="end-time" className="text-sm">End Time</Label>
                        <Select value={endTime} onValueChange={setEndTime}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TIME_SLOTS.map((time) => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button onClick={handleAddActivity} className="flex-1">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Activity
                      </Button>
                      <Button variant="outline" onClick={onClose}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}