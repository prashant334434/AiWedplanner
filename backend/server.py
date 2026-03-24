from fastapi import FastAPI, APIRouter, HTTPException, File, UploadFile
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
import base64
from emergentintegrations.llm.chat import LlmChat, UserMessage
from emergentintegrations.llm.openai.image_generation import OpenAIImageGeneration

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# Get API key
EMERGENT_LLM_KEY = os.getenv('EMERGENT_LLM_KEY', '')

# ==================== PYDANTIC MODELS ====================

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, field_schema):
        field_schema.update(type="string")


# Auth Models
class SendOTPRequest(BaseModel):
    phone: str

class VerifyOTPRequest(BaseModel):
    phone: str
    otp: str

class AuthResponse(BaseModel):
    user_id: str
    token: str
    message: str


# User Models
class User(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    phone: str
    name: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True


# Wedding Setup Models
class WeddingSetup(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    user_id: str
    wedding_type: str  # local or destination
    guest_count: int
    budget: float
    wedding_date: str
    location: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True


# Venue Models
class Venue(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    name: str
    description: str
    location: str
    price_range: str
    price_per_event: float
    capacity: int
    venue_type: str  # indoor/outdoor
    rating: float
    images: List[str]  # base64 images
    amenities: List[str]
    available_dates: List[str]
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True


class VenueFilter(BaseModel):
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    min_capacity: Optional[int] = None
    max_capacity: Optional[int] = None
    venue_type: Optional[str] = None
    location: Optional[str] = None


# Decoration Models
class Decoration(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    theme_name: str
    description: str
    price: float
    images: List[str]  # base64
    includes: List[str]
    customization_options: dict
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True


# Catering Models
class MenuItem(BaseModel):
    name: str
    category: str  # starter, main, dessert, drinks
    price_per_plate: float
    cuisine_type: str
    is_vegetarian: bool

class Caterer(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    name: str
    description: str
    cuisine_types: List[str]
    price_per_plate: float
    rating: float
    images: List[str]
    menu_items: List[MenuItem]
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True


class MenuSelection(BaseModel):
    user_id: str
    caterer_id: str
    selected_items: List[str]
    total_guests: int
    total_price: float


# Vendor Models
class Vendor(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    name: str
    category: str  # photographer, dj, makeup, pandit, band, planner
    description: str
    price_range: str
    rating: float
    portfolio_images: List[str]
    services: List[str]
    available_dates: List[str]
    contact: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True


# Booking Models
class Booking(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    user_id: str
    booking_type: str  # venue, vendor, caterer, decoration
    item_id: str
    booking_date: str
    amount: float
    payment_status: str  # pending, completed, failed
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True


# AI Models
class AIWeddingPlanRequest(BaseModel):
    user_input: str
    guest_count: Optional[int] = None
    budget: Optional[float] = None
    location: Optional[str] = None


class AIInvitationRequest(BaseModel):
    couple_names: str
    wedding_date: str
    venue: str
    message: str
    theme: str  # royal, minimal, traditional, modern


# Payment Models
class PaymentRequest(BaseModel):
    user_id: str
    booking_id: str
    amount: float


# ==================== API ENDPOINTS ====================

# Auth Endpoints
@api_router.post("/auth/send-otp")
async def send_otp(request: SendOTPRequest):
    # Mock OTP - In production, integrate with Twilio/Firebase
    return {
        "success": True,
        "message": "OTP sent successfully",
        "otp": "123456"  # Mock OTP for testing
    }


@api_router.post("/auth/verify-otp", response_model=AuthResponse)
async def verify_otp(request: VerifyOTPRequest):
    # Mock verification
    if request.otp != "123456":
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    # Check if user exists
    user = await db.users.find_one({"phone": request.phone})
    
    if not user:
        # Create new user
        user_data = {
            "phone": request.phone,
            "created_at": datetime.utcnow()
        }
        result = await db.users.insert_one(user_data)
        user_id = str(result.inserted_id)
    else:
        user_id = str(user["_id"])
    
    return AuthResponse(
        user_id=user_id,
        token=f"token_{user_id}",
        message="Login successful"
    )


# Wedding Setup Endpoints
@api_router.post("/wedding-setup")
async def create_wedding_setup(setup: WeddingSetup):
    setup_dict = setup.model_dump(exclude={'id'})
    result = await db.wedding_setups.insert_one(setup_dict)
    setup_dict["_id"] = str(result.inserted_id)
    return setup_dict


@api_router.get("/wedding-setup/{user_id}")
async def get_wedding_setup(user_id: str):
    setup = await db.wedding_setups.find_one({"user_id": user_id})
    if not setup:
        raise HTTPException(status_code=404, detail="Wedding setup not found")
    setup["_id"] = str(setup["_id"])
    return setup


# Venue Endpoints
@api_router.get("/venues")
async def get_venues(
    min_capacity: Optional[int] = None,
    max_capacity: Optional[int] = None,
    location: Optional[str] = None
):
    query = {}
    if min_capacity:
        query["capacity"] = {"$gte": min_capacity}
    if max_capacity:
        if "capacity" in query:
            query["capacity"]["$lte"] = max_capacity
        else:
            query["capacity"] = {"$lte": max_capacity}
    if location:
        query["location"] = {"$regex": location, "$options": "i"}
    
    venues = await db.venues.find(query).to_list(100)
    for venue in venues:
        venue["_id"] = str(venue["_id"])
    return venues


@api_router.get("/venues/{venue_id}")
async def get_venue(venue_id: str):
    venue = await db.venues.find_one({"_id": ObjectId(venue_id)})
    if not venue:
        raise HTTPException(status_code=404, detail="Venue not found")
    venue["_id"] = str(venue["_id"])
    return venue


@api_router.post("/venues")
async def create_venue(venue: Venue):
    venue_dict = venue.model_dump(exclude={'id'})
    result = await db.venues.insert_one(venue_dict)
    venue_dict["_id"] = str(result.inserted_id)
    return venue_dict


# Decoration Endpoints
@api_router.get("/decorations")
async def get_decorations():
    decorations = await db.decorations.find().to_list(100)
    for decoration in decorations:
        decoration["_id"] = str(decoration["_id"])
    return decorations


@api_router.get("/decorations/{decoration_id}")
async def get_decoration(decoration_id: str):
    decoration = await db.decorations.find_one({"_id": ObjectId(decoration_id)})
    if not decoration:
        raise HTTPException(status_code=404, detail="Decoration not found")
    decoration["_id"] = str(decoration["_id"])
    return decoration


@api_router.post("/decorations")
async def create_decoration(decoration: Decoration):
    decoration_dict = decoration.model_dump(exclude={'id'})
    result = await db.decorations.insert_one(decoration_dict)
    decoration_dict["_id"] = str(result.inserted_id)
    return decoration_dict


# Catering Endpoints
@api_router.get("/caterers")
async def get_caterers():
    caterers = await db.caterers.find().to_list(100)
    for caterer in caterers:
        caterer["_id"] = str(caterer["_id"])
    return caterers


@api_router.get("/caterers/{caterer_id}")
async def get_caterer(caterer_id: str):
    caterer = await db.caterers.find_one({"_id": ObjectId(caterer_id)})
    if not caterer:
        raise HTTPException(status_code=404, detail="Caterer not found")
    caterer["_id"] = str(caterer["_id"])
    return caterer


@api_router.post("/caterers")
async def create_caterer(caterer: Caterer):
    caterer_dict = caterer.model_dump(exclude={'id'})
    result = await db.caterers.insert_one(caterer_dict)
    caterer_dict["_id"] = str(result.inserted_id)
    return caterer_dict


@api_router.post("/menu-selection")
async def save_menu_selection(selection: MenuSelection):
    selection_dict = selection.model_dump()
    result = await db.menu_selections.insert_one(selection_dict)
    selection_dict["_id"] = str(result.inserted_id)
    return selection_dict


# Vendor Endpoints
@api_router.get("/vendors")
async def get_vendors(category: Optional[str] = None):
    query = {}
    if category:
        query["category"] = category
    
    vendors = await db.vendors.find(query).to_list(100)
    for vendor in vendors:
        vendor["_id"] = str(vendor["_id"])
    return vendors


@api_router.get("/vendors/{vendor_id}")
async def get_vendor(vendor_id: str):
    vendor = await db.vendors.find_one({"_id": ObjectId(vendor_id)})
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    vendor["_id"] = str(vendor["_id"])
    return vendor


@api_router.post("/vendors")
async def create_vendor(vendor: Vendor):
    vendor_dict = vendor.model_dump(exclude={'id'})
    result = await db.vendors.insert_one(vendor_dict)
    vendor_dict["_id"] = str(result.inserted_id)
    return vendor_dict


# Booking Endpoints
@api_router.post("/bookings")
async def create_booking(booking: Booking):
    booking_dict = booking.model_dump(exclude={'id'})
    result = await db.bookings.insert_one(booking_dict)
    booking_dict["_id"] = str(result.inserted_id)
    return booking_dict


@api_router.get("/bookings/{user_id}")
async def get_user_bookings(user_id: str):
    bookings = await db.bookings.find({"user_id": user_id}).to_list(100)
    for booking in bookings:
        booking["_id"] = str(booking["_id"])
    return bookings


# AI Wedding Planner Endpoint
@api_router.post("/ai/wedding-plan")
async def generate_wedding_plan(request: AIWeddingPlanRequest):
    try:
        # Initialize AI chat
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"wedding_plan_{datetime.utcnow().timestamp()}",
            system_message="You are an expert wedding planner. Analyze the user's requirements and provide personalized wedding recommendations including venues, decorations, catering, and vendors. Provide your response in a structured JSON format."
        ).with_model("openai", "gpt-5.2")
        
        # Create prompt
        prompt = f"""Based on the following wedding requirements, provide detailed recommendations:

User Input: {request.user_input}
Guest Count: {request.guest_count or 'Not specified'}
Budget: ₹{request.budget or 'Not specified'}
Location: {request.location or 'Not specified'}

Please provide recommendations for:
1. Venue suggestions
2. Decoration themes
3. Catering options
4. Vendors needed
5. Estimated cost breakdown

Format your response as JSON with keys: venues, decorations, catering, vendors, cost_breakdown"""

        message = UserMessage(text=prompt)
        response = await chat.send_message(message)
        
        return {
            "success": True,
            "recommendations": response
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI planning failed: {str(e)}")


# AI Invitation Generator Endpoint
@api_router.post("/ai/generate-invitation")
async def generate_invitation(request: AIInvitationRequest):
    try:
        # Initialize image generation
        image_gen = OpenAIImageGeneration(api_key=EMERGENT_LLM_KEY)
        
        # Create prompt based on theme
        theme_prompts = {
            "royal": "Luxury royal wedding invitation with gold accents, ornate patterns, and elegant typography",
            "minimal": "Minimalist modern wedding invitation with clean lines, soft colors, and elegant simplicity",
            "traditional": "Traditional Indian wedding invitation with intricate patterns, vibrant colors, and cultural motifs",
            "modern": "Contemporary wedding invitation with geometric shapes, bold typography, and stylish design"
        }
        
        base_prompt = theme_prompts.get(request.theme, theme_prompts["modern"])
        full_prompt = f"{base_prompt}. Wedding invitation for {request.couple_names}, Date: {request.wedding_date}, Venue: {request.venue}. {request.message}"
        
        # Generate image
        images = await image_gen.generate_images(
            prompt=full_prompt,
            model="gpt-image-1",
            number_of_images=1
        )
        
        if images and len(images) > 0:
            image_base64 = base64.b64encode(images[0]).decode('utf-8')
            
            # Save to database
            invitation_data = {
                "couple_names": request.couple_names,
                "wedding_date": request.wedding_date,
                "venue": request.venue,
                "message": request.message,
                "theme": request.theme,
                "image_base64": image_base64,
                "created_at": datetime.utcnow()
            }
            result = await db.invitations.insert_one(invitation_data)
            
            return {
                "success": True,
                "invitation_id": str(result.inserted_id),
                "image_base64": image_base64
            }
        else:
            raise HTTPException(status_code=500, detail="No image was generated")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Invitation generation failed: {str(e)}")


# Payment Endpoint (Mocked)
@api_router.post("/payment/create-order")
async def create_payment_order(payment: PaymentRequest):
    # Mock payment - In production, integrate with Razorpay
    payment_data = {
        "order_id": f"order_{datetime.utcnow().timestamp()}",
        "user_id": payment.user_id,
        "booking_id": payment.booking_id,
        "amount": payment.amount,
        "currency": "INR",
        "status": "created",
        "created_at": datetime.utcnow()
    }
    
    result = await db.payments.insert_one(payment_data)
    payment_data["_id"] = str(result.inserted_id)
    
    return {
        "success": True,
        "order_id": payment_data["order_id"],
        "amount": payment.amount,
        "message": "Payment order created (mocked)"
    }


# Budget Calculation Endpoint
@api_router.get("/budget/{user_id}")
async def calculate_budget(user_id: str):
    bookings = await db.bookings.find({"user_id": user_id}).to_list(100)
    
    breakdown = {
        "venue": 0,
        "decoration": 0,
        "catering": 0,
        "vendors": 0,
        "total": 0
    }
    
    for booking in bookings:
        booking_type = booking.get("booking_type", "")
        amount = booking.get("amount", 0)
        
        if booking_type in breakdown:
            breakdown[booking_type] += amount
        
        breakdown["total"] += amount
    
    return breakdown


# Health check
@api_router.get("/")
async def root():
    return {"message": "WedPlanner AI API", "status": "running"}


# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
