'use client';

import { useState } from 'react';
import { Calendar, Plus, Cloud, Sun, CloudRain, Snowflake } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DayPlan, ScheduledActivity, WeatherForecast } from '@/lib/api';
import ActivityCard from './ActivityCard';

interface DayPlanCardProps {
  dayPlan: DayPlan;
  dayNumber: number;
  weather?: WeatherForecast;
  onActivityEdit?: (activity: ScheduledActivity) => void;
  onActivityRemove?: (dayPlanId: string, activityId: string) => void;
  onActivityTimeChange?: (dayPlanId: string, activityId: string, startTime: string, endTime: string) => void;
  onActivityReorder?: (dayPlanId: string, activityIds: string[]) => void;
  onAddActivity?: (dayPlanId: string) => void;
  isEditable?: boolean;
}

export default function DayPlanCard({
  dayPlan,
  dayNumber,
  weather,
  onActivityEdit,
  onActivityRemove,
  onActivityTimeChange,
  onActivityReorder,
  onAddActivity,
  isEditable = false
}: DayPlanCardProps) {
  const [draggedActivity, setDraggedActivity] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  };

  const getWeatherIcon = (condition: string) => {
    const icons: Record<string, JSX.Element> = {
      'clear': <Sun className="w-4 h-4 text-yellow-500" />,
      'cloudy': <Cloud className="w-4 h-4 text-gray-500" />,
      'rain': <CloudRain className="w-4 h-4 text-blue-500" />,
      'snow': <Snowflake className="w-4 h-4 text-blue-200" />,
    };
    return icons[condition.toLowerCase()] || <Cloud className="w-4 h-4 text-gray-500" />;
  };

  const handleDragStart = (activityId: string) => {
    setDraggedActivity(activityId);
  };

  const handleDragEnd = () => {
    setDraggedActivity(null);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (!draggedActivity || !onActivityReorder) return;

    const activities = dayPlan.activities;
    const draggedIndex = activities.findIndex(a => a.id === draggedActivity);
    
    if (draggedIndex === -1 || draggedIndex === targetIndex) return;

    const newActivities = [...activities];
    const [draggedItem] = newActivities.splice(draggedIndex, 1);
    newActivities.splice(targetIndex, 0, draggedItem);

    onActivityReorder(dayPlan.id, newActivities.map(a => a.id));
  };

  const getTotalDuration = () => {
    if (!dayPlan.activities.length) return 0;
    
    const firstStart = dayPlan.activities[0].startTime;
    const lastEnd = dayPlan.activities[dayPlan.activities.length - 1].endTime;
    
    const startMinutes = timeToMinutes(firstStart);
    const endMinutes = timeToMinutes(lastEnd);
    
    return Math.round((endMinutes - startMinutes) / 60 * 10) / 10; // Round to 1 decimal
  };

  const timeToMinutes = (timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Day {dayNumber}</CardTitle>
            </div>
            <div className="text-sm text-muted-foreground">
              {formatDate(dayPlan.date)}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {weather && (
              <div className="flex items-center gap-2 text-sm">
                {getWeatherIcon(weather.condition)}
                <span className="text-muted-foreground">
                  {weather.temperature.max}°/{weather.temperature.min}°
                </span>
              </div>
            )}
            
            <Badge variant="outline">
              {dayPlan.activities.length} activities
            </Badge>
            
            {dayPlan.activities.length > 0 && (
              <Badge variant="secondary">
                {getTotalDuration()}h total
              </Badge>
            )}
          </div>
        </div>

        {weather && (
          <div className="text-sm text-muted-foreground">
            {weather.description} • {weather.humidity}% humidity • {weather.windSpeed} mph wind
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        {dayPlan.activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No activities planned for this day</p>
            {isEditable && onAddActivity && (
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => onAddActivity(dayPlan.id)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Activity
              </Button>
            )}
          </div>
        ) : (
          <>
            {dayPlan.activities.map((activity, index) => (
              <div
                key={activity.id}
                draggable={isEditable}
                onDragStart={() => handleDragStart(activity.id)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, index)}
                className="relative"
              >
                <ActivityCard
                  activity={activity}
                  onEdit={isEditable ? onActivityEdit : undefined}
                  onRemove={isEditable && onActivityRemove ? (id) => onActivityRemove(dayPlan.id, id) : undefined}
                  onTimeChange={isEditable && onActivityTimeChange ? (id, start, end) => onActivityTimeChange(dayPlan.id, id, start, end) : undefined}
                  isDragging={draggedActivity === activity.id}
                  showDragHandle={isEditable}
                />
                
                {/* Travel time indicator */}
                {index < dayPlan.activities.length - 1 && (
                  <div className="flex items-center justify-center py-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                      <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                      <span>Travel time</span>
                      <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {isEditable && onAddActivity && (
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => onAddActivity(dayPlan.id)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Activity
              </Button>
            )}
          </>
        )}

        {dayPlan.notes && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">{dayPlan.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}