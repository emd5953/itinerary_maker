'use client';

import { Cloud, Sun, CloudRain, Snowflake, Wind, Droplets, Thermometer, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WeatherForecast } from '@/lib/api';

interface WeatherCardProps {
  weather: WeatherForecast[];
  destination: string;
}

export default function WeatherCard({ weather, destination }: WeatherCardProps) {
  const getWeatherIcon = (condition: string, size: number = 20) => {
    const iconProps = { size, className: "text-current" };
    
    const icons: Record<string, React.ReactElement> = {
      'clear': <Sun {...iconProps} className="text-yellow-500" />,
      'sunny': <Sun {...iconProps} className="text-yellow-500" />,
      'cloudy': <Cloud {...iconProps} className="text-gray-500" />,
      'partly cloudy': <Cloud {...iconProps} className="text-gray-400" />,
      'overcast': <Cloud {...iconProps} className="text-gray-600" />,
      'rain': <CloudRain {...iconProps} className="text-blue-500" />,
      'light rain': <CloudRain {...iconProps} className="text-blue-400" />,
      'heavy rain': <CloudRain {...iconProps} className="text-blue-600" />,
      'snow': <Snowflake {...iconProps} className="text-blue-200" />,
      'light snow': <Snowflake {...iconProps} className="text-blue-100" />,
      'heavy snow': <Snowflake {...iconProps} className="text-blue-300" />,
    };
    
    return icons[condition.toLowerCase()] || <Cloud {...iconProps} className="text-gray-500" />;
  };

  const getWeatherGradient = (condition: string) => {
    const gradients: Record<string, string> = {
      'clear': 'from-yellow-100 to-orange-100',
      'sunny': 'from-yellow-100 to-orange-100',
      'cloudy': 'from-gray-100 to-slate-200',
      'partly cloudy': 'from-blue-50 to-gray-100',
      'overcast': 'from-gray-200 to-slate-300',
      'rain': 'from-blue-100 to-slate-200',
      'light rain': 'from-blue-50 to-slate-100',
      'heavy rain': 'from-blue-200 to-slate-300',
      'snow': 'from-blue-50 to-slate-100',
      'light snow': 'from-blue-25 to-slate-50',
      'heavy snow': 'from-blue-100 to-slate-200',
    };
    
    return gradients[condition.toLowerCase()] || 'from-gray-100 to-slate-200';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTemperatureColor = (temp: number) => {
    if (temp >= 80) return 'text-red-600';
    if (temp >= 70) return 'text-orange-600';
    if (temp >= 60) return 'text-yellow-600';
    if (temp >= 50) return 'text-green-600';
    if (temp >= 40) return 'text-blue-600';
    return 'text-blue-800';
  };

  if (!weather || weather.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="w-5 h-5" />
            Weather Forecast
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            <Cloud className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Weather data not available for {destination}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cloud className="w-5 h-5" />
          Weather Forecast for {destination}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {weather.map((day) => (
            <div
              key={day.date}
              className={`p-4 rounded-lg bg-gradient-to-br ${getWeatherGradient(day.condition)} border`}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-medium text-sm">{formatDate(day.date)}</p>
                  <p className="text-xs text-muted-foreground capitalize">{day.condition}</p>
                </div>
                {getWeatherIcon(day.condition, 24)}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Thermometer className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Temp</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`text-sm font-medium ${getTemperatureColor(day.temperature.max)}`}>
                      {day.temperature.max}°
                    </span>
                    <span className="text-xs text-muted-foreground">/</span>
                    <span className={`text-xs ${getTemperatureColor(day.temperature.min)}`}>
                      {day.temperature.min}°
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Droplets className="w-3 h-3 text-blue-500" />
                    <span className="text-xs text-muted-foreground">Humidity</span>
                  </div>
                  <span className="text-xs">{day.humidity}%</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Wind className="w-3 h-3 text-gray-500" />
                    <span className="text-xs text-muted-foreground">Wind</span>
                  </div>
                  <span className="text-xs">{day.windSpeed} mph</span>
                </div>
              </div>
              
              {day.description && (
                <div className="mt-3 pt-2 border-t border-white/20">
                  <p className="text-xs text-muted-foreground">{day.description}</p>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Weather Summary */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Trip Weather Summary
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Avg High</p>
              <p className="font-medium">
                {Math.round(weather.reduce((sum, day) => sum + day.temperature.max, 0) / weather.length)}°F
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Avg Low</p>
              <p className="font-medium">
                {Math.round(weather.reduce((sum, day) => sum + day.temperature.min, 0) / weather.length)}°F
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Avg Humidity</p>
              <p className="font-medium">
                {Math.round(weather.reduce((sum, day) => sum + day.humidity, 0) / weather.length)}%
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Avg Wind</p>
              <p className="font-medium">
                {Math.round(weather.reduce((sum, day) => sum + day.windSpeed, 0) / weather.length)} mph
              </p>
            </div>
          </div>
          
          {/* Weather Recommendations */}
          <div className="mt-4">
            <h5 className="font-medium mb-2">Packing Recommendations</h5>
            <div className="flex flex-wrap gap-2">
              {weather.some(day => day.condition.toLowerCase().includes('rain')) && (
                <Badge variant="secondary">🌧️ Bring rain gear</Badge>
              )}
              {weather.some(day => day.temperature.max >= 80) && (
                <Badge variant="secondary">☀️ Pack light clothing</Badge>
              )}
              {weather.some(day => day.temperature.min <= 50) && (
                <Badge variant="secondary">🧥 Bring warm layers</Badge>
              )}
              {weather.some(day => day.windSpeed >= 15) && (
                <Badge variant="secondary">💨 Expect windy conditions</Badge>
              )}
              {weather.some(day => day.condition.toLowerCase().includes('snow')) && (
                <Badge variant="secondary">❄️ Winter gear needed</Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}