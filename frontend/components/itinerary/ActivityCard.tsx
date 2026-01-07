'use client';

import { useState } from 'react';
import { Star, MapPin, Clock, ExternalLink, Edit2, Trash2, GripVertical } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScheduledActivity } from '@/lib/api';
import { formatTime } from '@/lib/api';

interface ActivityCardProps {
  activity: ScheduledActivity;
  onEdit?: (activity: ScheduledActivity) => void;
  onRemove?: (activityId: string) => void;
  onTimeChange?: (activityId: string, startTime: string, endTime: string) => void;
  isDragging?: boolean;
  dragHandleProps?: any;
  showDragHandle?: boolean;
}

export default function ActivityCard({ 
  activity, 
  onEdit, 
  onRemove, 
  onTimeChange,
  isDragging,
  dragHandleProps,
  showDragHandle = false
}: ActivityCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedStartTime, setEditedStartTime] = useState(formatTime(activity.startTime));
  const [editedEndTime, setEditedEndTime] = useState(formatTime(activity.endTime));

  const handleTimeSubmit = () => {
    if (onTimeChange) {
      onTimeChange(activity.id, editedStartTime + ':00', editedEndTime + ':00');
    }
    setIsEditing(false);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'SIGHTS': 'bg-blue-100 text-blue-800',
      'FOOD': 'bg-orange-100 text-orange-800',
      'OUTDOOR': 'bg-green-100 text-green-800',
      'NIGHTLIFE': 'bg-purple-100 text-purple-800',
      'SHOPPING': 'bg-pink-100 text-pink-800',
      'CULTURE': 'bg-indigo-100 text-indigo-800',
      'ADVENTURE': 'bg-red-100 text-red-800',
      'RELAXATION': 'bg-teal-100 text-teal-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      'SIGHTS': '🏛️',
      'FOOD': '🍽️',
      'OUTDOOR': '🏞️',
      'NIGHTLIFE': '🌃',
      'SHOPPING': '🛍️',
      'CULTURE': '🎨',
      'ADVENTURE': '🏔️',
      'RELAXATION': '🧘',
    };
    return icons[category] || '📍';
  };

  return (
    <Card className={`transition-all duration-200 ${isDragging ? 'shadow-lg rotate-2 scale-105' : 'hover:shadow-md'}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {showDragHandle && (
            <div {...dragHandleProps} className="cursor-grab active:cursor-grabbing mt-1">
              <GripVertical className="w-4 h-4 text-muted-foreground" />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{getCategoryIcon(activity.category)}</span>
                  <h3 className="font-medium text-foreground truncate">{activity.name}</h3>
                  {activity.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm text-muted-foreground">{activity.rating}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className={getCategoryColor(activity.category)}>
                    {activity.category.toLowerCase().replace('_', ' ')}
                  </Badge>
                  {activity.priceRange && (
                    <Badge variant="outline">{activity.priceRange}</Badge>
                  )}
                </div>

                {activity.location?.address && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{activity.location.address}</span>
                  </div>
                )}

                {activity.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {activity.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-1 ml-2">
                {activity.websiteUrl && (
                  <Button variant="ghost" size="icon" asChild>
                    <a href={activity.websiteUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                )}
                {onEdit && (
                  <Button variant="ghost" size="icon" onClick={() => onEdit(activity)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                )}
                {onRemove && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => onRemove(activity.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Time Display/Edit */}
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={editedStartTime}
                    onChange={(e) => setEditedStartTime(e.target.value)}
                    className="text-sm border rounded px-2 py-1"
                  />
                  <span className="text-muted-foreground">to</span>
                  <input
                    type="time"
                    value={editedEndTime}
                    onChange={(e) => setEditedEndTime(e.target.value)}
                    className="text-sm border rounded px-2 py-1"
                  />
                  <Button size="sm" onClick={handleTimeSubmit}>Save</Button>
                  <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {formatTime(activity.startTime)} - {formatTime(activity.endTime)}
                  </span>
                  {onTimeChange && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setIsEditing(true)}
                      className="text-xs"
                    >
                      Edit time
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}