# 🚀 Itinerary Generation Engine

## Overview

The aSpot itinerary generation engine creates personalized travel itineraries by pulling real data from multiple APIs and matching activities to user preferences and ratings.

## 🎯 How It Works

### 1. **Multi-Source Activity Discovery**
- **Google Places API** - Tourist attractions, restaurants, parks, museums
- **Yelp API** - Restaurants, bars, local businesses with reviews
- **Smart Deduplication** - Removes duplicate activities from different sources

### 2. **Intelligent Recommendation Scoring**
- **Rating Weight (30%)** - Higher rated activities score better
- **Review Count (10%)** - More reviews = more reliable
- **Interest Matching (40%)** - Matches user's interests (sights, food, outdoor, etc.)
- **Budget Compatibility (15%)** - Matches user's budget level
- **Popularity Bonus (5%)** - Extra points for popular spots

### 3. **Smart Scheduling Algorithm**
- **Time Slot Optimization** - Activities scheduled based on type and time of day
  - Morning: Sights, outdoor activities, culture
  - Afternoon: Sights, shopping, food
  - Evening: Food, nightlife, culture
- **Travel Style Adaptation**:
  - **Relaxed**: 3 activities/day (10am-12pm, 2pm-5pm, 7pm-9pm)
  - **Moderate**: 4 activities/day (9am-11:30am, 1pm-4pm, 5:30pm-7:30pm, 8pm-10pm)
  - **Packed**: 5 activities/day (8am-10:30am, 11am-1pm, 2pm-4:30pm, 5pm-7pm, 8pm-10:30pm)

## 🔧 API Setup

### Required API Keys (Optional - Works with Mock Data)

```bash
# Google Places API
GOOGLE_PLACES_API_KEY=your_google_places_key

# Yelp Fusion API
YELP_API_KEY=your_yelp_api_key
```

**Note**: If API keys are not configured, the system automatically uses high-quality mock data for testing.

## 🚀 Usage

### Generate Itinerary API

```bash
POST /api/itineraries/generate
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "destination": "New York",
  "startDate": "2024-06-01",
  "endDate": "2024-06-03"
}
```

### Response Example

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "John's Trip to New York",
  "destination": "New York",
  "startDate": "2024-06-01",
  "endDate": "2024-06-03",
  "dayPlans": [
    {
      "dayNumber": 1,
      "date": "2024-06-01",
      "scheduledActivities": [
        {
          "sequenceNumber": 1,
          "startTime": "09:00",
          "endTime": "11:30",
          "activity": {
            "name": "Central Park",
            "category": "OUTDOOR",
            "rating": 4.7,
            "priceRange": "Free",
            "location": {
              "latitude": 40.7829,
              "longitude": -73.9654,
              "address": "New York, NY"
            }
          }
        }
      ]
    }
  ]
}
```

## 🎯 User Preference Matching

The system uses user preferences to personalize recommendations:

### Interest Categories
- **sights** - Tourist attractions, landmarks, viewpoints
- **food** - Restaurants, cafes, food markets
- **outdoor** - Parks, hiking, outdoor activities
- **nightlife** - Bars, clubs, entertainment
- **shopping** - Malls, markets, boutiques
- **culture** - Museums, galleries, theaters

### Budget Levels
- **BUDGET** - Prefers free and $ activities
- **MID_RANGE** - Balanced mix, prefers $ and $$
- **LUXURY** - Prefers $$$ and $$$$ experiences

### Travel Styles
- **RELAXED** - 3 activities/day with longer breaks
- **MODERATE** - 4 activities/day, balanced pace
- **PACKED** - 5 activities/day, maximize experiences

## 🧪 Testing

```bash
# Run itinerary generation tests
./mvnw test -Dtest=ItineraryGenerationServiceTest

# Test with real APIs (requires API keys)
./mvnw test -Dtest=GooglePlacesServiceTest
./mvnw test -Dtest=YelpServiceTest
```

## 🔄 Mock Data Mode

When API keys are not configured, the system automatically generates realistic mock data:

- **Google Places Mock**: Tourist attractions with ratings 4.2-5.0
- **Yelp Mock**: Local businesses with ratings 4.1-4.7
- **Realistic Locations**: NYC-area coordinates and addresses
- **Varied Categories**: Balanced mix of activity types

## 🚀 Example Generated Itinerary

**3-Day New York Trip (Moderate Style)**

**Day 1**
- 9:00-11:30 AM: Central Park (Outdoor, 4.7★)
- 1:00-4:00 PM: Metropolitan Museum (Culture, 4.6★)
- 5:30-7:30 PM: Times Square (Sights, 4.3★)
- 8:00-10:00 PM: Joe's Pizza (Food, 4.5★)

**Day 2**
- 9:00-11:30 AM: Statue of Liberty (Sights, 4.8★)
- 1:00-4:00 PM: Brooklyn Bridge (Sights, 4.7★)
- 5:30-7:30 PM: Chelsea Market (Shopping, 4.4★)
- 8:00-10:00 PM: Rooftop Bar (Nightlife, 4.6★)

**Day 3**
- 9:00-11:30 AM: High Line Park (Outdoor, 4.6★)
- 1:00-4:00 PM: 9/11 Memorial (Culture, 4.8★)
- 5:30-7:30 PM: Little Italy (Food, 4.5★)
- 8:00-10:00 PM: Broadway Show (Culture, 4.9★)

## 🎯 Next Steps

1. **Add More APIs**: TripAdvisor, Foursquare, local tourism boards
2. **Machine Learning**: Learn from user feedback to improve recommendations
3. **Real-time Optimization**: Adjust for weather, events, crowds
4. **Travel Time Calculation**: Optimize routes between activities
5. **Collaborative Filtering**: "Users like you also enjoyed..."

## 🔧 Architecture

```
User Request
    ↓
ItineraryController
    ↓
ItineraryService
    ↓
ItineraryGenerationService
    ↓
ActivityRecommendationService
    ↓
┌─────────────────┬─────────────────┐
│ GooglePlacesService │ YelpService │
└─────────────────┴─────────────────┘
    ↓
Scored & Scheduled Activities
    ↓
Complete Itinerary with Day Plans
```

**The system now generates real, personalized itineraries based on top-rated activities and user preferences!** 🎉