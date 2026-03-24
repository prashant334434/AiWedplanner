# Additional API endpoints for Phase 2 features
# This file extends the main server.py with new functionality

from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

# Reviews Models and Endpoints
class Review(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    item_id: str  # venue, vendor, caterer, decoration
    item_type: str
    user_id: str
    rating: float
    comment: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True


class Availability(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    item_id: str
    item_type: str  # venue, vendor
    available_dates: List[str]
    booked_dates: List[str]
    
    class Config:
        populate_by_name = True


class InvitationContact(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    user_id: str
    invitation_id: str
    contacts: List[dict]  # {name, phone}
    sent_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True


# Sample data for seeding
SAMPLE_VENUES = [
    {
        "name": "Grand Palace Hotel",
        "description": "Luxurious 5-star venue with breathtaking architecture and world-class amenities. Perfect for grand celebrations.",
        "location": "Mumbai",
        "price_range": "₹5L - ₹10L",
        "price_per_event": 750000,
        "capacity": 500,
        "venue_type": "indoor",
        "rating": 4.8,
        "images": ["palace_1", "palace_2", "palace_3"],
        "amenities": ["Parking", "AC Halls", "Catering", "Decoration", "Valet"],
        "available_dates": ["2025-12-15", "2025-12-20", "2026-01-10"],
        "created_at": datetime.utcnow()
    },
    {
        "name": "Royal Gardens",
        "description": "Beautiful outdoor garden venue with lush greenery and scenic views. Ideal for destination weddings.",
        "location": "Jaipur",
        "price_range": "₹3L - ₹6L",
        "price_per_event": 450000,
        "capacity": 300,
        "venue_type": "outdoor",
        "rating": 4.6,
        "images": ["garden_1", "garden_2", "garden_3"],
        "amenities": ["Garden", "Outdoor Seating", "Stage", "Lighting", "Parking"],
        "available_dates": ["2025-11-25", "2025-12-05", "2026-01-15"],
        "created_at": datetime.utcnow()
    },
    {
        "name": "Sunset Beach Resort",
        "description": "Stunning beachfront property offering romantic sunset views. Perfect for intimate beach weddings.",
        "location": "Goa",
        "price_range": "₹4L - ₹8L",
        "price_per_event": 600000,
        "capacity": 200,
        "venue_type": "outdoor",
        "rating": 4.9,
        "images": ["beach_1", "beach_2", "beach_3"],
        "amenities": ["Beach Access", "Ocean View", "Cabanas", "BBQ", "Bar"],
        "available_dates": ["2025-12-10", "2026-01-20", "2026-02-14"],
        "created_at": datetime.utcnow()
    }
]

SAMPLE_VENDORS = [
    {
        "name": "Rahul Photography",
        "category": "photographer",
        "description": "Award-winning wedding photographer with 10+ years experience. Specializes in candid and traditional photography.",
        "price_range": "₹50K - ₹1L",
        "rating": 4.9,
        "portfolio_images": ["photo_1", "photo_2", "photo_3", "photo_4"],
        "services": ["Pre-wedding", "Wedding Day", "Reception", "Album Design", "Drone Coverage"],
        "available_dates": ["2025-12-15", "2025-12-25", "2026-01-05"],
        "contact": "+91-9876543210",
        "created_at": datetime.utcnow()
    },
    {
        "name": "DJ Beats Entertainment",
        "category": "dj",
        "description": "Professional DJ services with state-of-the-art equipment. Specializes in Bollywood and EDM.",
        "price_range": "₹30K - ₹60K",
        "rating": 4.7,
        "portfolio_images": ["dj_1", "dj_2", "dj_3"],
        "services": ["Music", "Sound System", "Lighting", "LED Screens", "Fog Effects"],
        "available_dates": ["2025-12-20", "2026-01-10", "2026-01-25"],
        "contact": "+91-9876543211",
        "created_at": datetime.utcnow()
    },
    {
        "name": "Glamour Makeup Studio",
        "category": "makeup",
        "description": "Celebrity makeup artist specializing in bridal makeup. Uses premium international products.",
        "price_range": "₹40K - ₹80K",
        "rating": 4.8,
        "portfolio_images": ["makeup_1", "makeup_2", "makeup_3", "makeup_4"],
        "services": ["Bridal Makeup", "Hair Styling", "Draping", "Family Makeup", "Trial Session"],
        "available_dates": ["2025-12-15", "2025-12-30", "2026-01-20"],
        "contact": "+91-9876543212",
        "created_at": datetime.utcnow()
    }
]

SAMPLE_DECORATIONS = [
    {
        "theme_name": "Royal Theme",
        "description": "Opulent royal theme with gold and burgundy colors, crystal chandeliers, and luxurious fabrics.",
        "price": 250000,
        "images": ["royal_1", "royal_2", "royal_3"],
        "includes": ["Stage Decoration", "Mandap", "Entrance Arch", "Floral Arrangements", "Lighting"],
        "customization_options": {
            "colors": ["Gold & Burgundy", "Gold & Purple", "Gold & Navy"],
            "flowers": ["Roses", "Orchids", "Lilies"],
            "lighting": ["Warm", "Cool", "Mixed"]
        },
        "created_at": datetime.utcnow()
    },
    {
        "theme_name": "Floral Paradise",
        "description": "Fresh floral theme with pastel colors and natural elements. Perfect for garden weddings.",
        "price": 180000,
        "images": ["floral_1", "floral_2", "floral_3"],
        "includes": ["Floral Stage", "Flower Walls", "Centerpieces", "Garlands", "Bouquets"],
        "customization_options": {
            "colors": ["Pink & White", "Peach & Cream", "Lavender & White"],
            "flowers": ["Roses", "Peonies", "Hydrangeas"],
            "style": ["Rustic", "Elegant", "Bohemian"]
        },
        "created_at": datetime.utcnow()
    },
    {
        "theme_name": "Modern Minimal",
        "description": "Contemporary minimalist design with clean lines and elegant simplicity.",
        "price": 150000,
        "images": ["minimal_1", "minimal_2", "minimal_3"],
        "includes": ["Stage Setup", "Backdrop", "LED Lighting", "Geometric Elements", "Greenery"],
        "customization_options": {
            "colors": ["White & Green", "Black & Gold", "Grey & Rose Gold"],
            "style": ["Industrial", "Scandinavian", "Contemporary"],
            "lighting": ["Neon", "LED", "Edison Bulbs"]
        },
        "created_at": datetime.utcnow()
    }
]

SAMPLE_CATERERS = [
    {
        "name": "Royal Feast Catering",
        "description": "Premium catering service offering authentic Indian and international cuisines.",
        "cuisine_types": ["North Indian", "South Indian", "Continental", "Chinese"],
        "price_per_plate": 1200,
        "rating": 4.7,
        "images": ["caterer_1", "caterer_2", "caterer_3"],
        "menu_items": [
            {"name": "Paneer Tikka", "category": "starter", "price_per_plate": 150, "cuisine_type": "North Indian", "is_vegetarian": True},
            {"name": "Chicken Tandoori", "category": "starter", "price_per_plate": 180, "cuisine_type": "North Indian", "is_vegetarian": False},
            {"name": "Dal Makhani", "category": "main", "price_per_plate": 200, "cuisine_type": "North Indian", "is_vegetarian": True},
            {"name": "Butter Chicken", "category": "main", "price_per_plate": 250, "cuisine_type": "North Indian", "is_vegetarian": False},
            {"name": "Gulab Jamun", "category": "dessert", "price_per_plate": 80, "cuisine_type": "Indian", "is_vegetarian": True},
            {"name": "Ice Cream", "category": "dessert", "price_per_plate": 60, "cuisine_type": "Continental", "is_vegetarian": True}
        ],
        "created_at": datetime.utcnow()
    },
    {
        "name": "Spice Garden Caterers",
        "description": "Traditional South Indian catering with authentic flavors and live cooking stations.",
        "cuisine_types": ["South Indian", "North Indian", "Chaat", "Live Counters"],
        "price_per_plate": 900,
        "rating": 4.6,
        "images": ["caterer_4", "caterer_5"],
        "menu_items": [
            {"name": "Masala Dosa", "category": "starter", "price_per_plate": 100, "cuisine_type": "South Indian", "is_vegetarian": True},
            {"name": "Idli Sambar", "category": "starter", "price_per_plate": 80, "cuisine_type": "South Indian", "is_vegetarian": True},
            {"name": "Hyderabadi Biryani", "category": "main", "price_per_plate": 220, "cuisine_type": "Hyderabadi", "is_vegetarian": False},
            {"name": "Veg Biryani", "category": "main", "price_per_plate": 180, "cuisine_type": "Hyderabadi", "is_vegetarian": True},
            {"name": "Rasmalai", "category": "dessert", "price_per_plate": 90, "cuisine_type": "Indian", "is_vegetarian": True}
        ],
        "created_at": datetime.utcnow()
    }
]
