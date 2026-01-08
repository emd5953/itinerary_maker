'use client';

import { useState, useEffect } from 'react';
import { Edit, Clock, MapPin, ExternalLink, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { type ScheduledActivity } from '@/lib/api';
import { toast } from 'sonner';

interface ActivityEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: ScheduledActivity | null;
  onSave: (updates: Partial<ScheduledActivity>) => void;
}

const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
  '20:00', '20:30', '21:00', '21:30', '22:00'
];

const PRICE_RANGES = [
  'Free',
  '$',
  '$$',
  '$$$',
  '$$$$'
];

export default function ActivityEditModal({
  isOpen,
  onClose,
  activity,
  onSave
}: ActivityEditModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startTime: '',
    endTime: '',
    websiteUrl: '',
    priceRange: '',
    address: ''
  });

  useEffect(() => {
    if (activity) {
      setFormData({
        name: activity.name || '',
        description: activity.description || '',
        startTime: activity.startTime?.substring(0, 5) || '', // Convert HH:mm:ss to HH:mm
        endTime: activity.endTime?.substring(0, 5) || '',
        websiteUrl: activity.websiteUrl || '',
        priceRange: activity.priceRange || '',
        address: activity.location?.address || ''
      });
    }
  }, [activity]);

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error('Activity name is required');
      return;
    }

    if (!formData.startTime || !formData.endTime) {
      toast.error('Start and end times are required');
      return;
    }

    // Validate time order
    const start = new Date(`2000-01-01T${formData.startTime}:00`);
    const end = new Date(`2000-01-01T${formData.endTime}:00`);
    
    if (end <= start) {
      toast.error('End time must be after start time');
      return;
    }

    const updates: Partial<ScheduledActivity> = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      startTime: formData.startTime + ':00', // Convert back to HH:mm:ss
      endTime: formData.endTime + ':00',
      websiteUrl: formData.websiteUrl.trim() || undefined,
      priceRange: formData.priceRange || undefined
    };

    // Update location if address changed
    if (activity && formData.address !== activity.location?.address) {
      updates.location = {
        ...activity.location,
        address: formData.address.trim()
      };
    }

    onSave(updates);
    onClose();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!activity) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="w-5 h-5" />
            Edit Activity
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Activity Name */}
          <div>
            <Label htmlFor="name">Activity Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter activity name"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Add a description..."
              rows={3}
            />
          </div>

          {/* Time Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start-time">Start Time</Label>
              <Select value={formData.startTime} onValueChange={(value) => handleInputChange('startTime', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select start time" />
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
              <Label htmlFor="end-time">End Time</Label>
              <Select value={formData.endTime} onValueChange={(value) => handleInputChange('endTime', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select end time" />
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

          {/* Location */}
          <div>
            <Label htmlFor="address">Address</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Enter address"
                className="pl-10"
              />
            </div>
          </div>

          {/* Price Range and Website */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price-range">Price Range (Optional)</Label>
              <Select value={formData.priceRange} onValueChange={(value) => handleInputChange('priceRange', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select price range" />
                </SelectTrigger>
                <SelectContent>
                  {PRICE_RANGES.map((range) => (
                    <SelectItem key={range} value={range}>
                      {range}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="website">Website (Optional)</Label>
              <div className="relative">
                <ExternalLink className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="website"
                  value={formData.websiteUrl}
                  onChange={(e) => handleInputChange('websiteUrl', e.target.value)}
                  placeholder="https://..."
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}