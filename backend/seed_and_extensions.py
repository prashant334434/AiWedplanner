# Additional endpoints for reviews, availability, contact invitations, and seed data
# Import this into server.py

from datetime import datetime
from server_extensions import SAMPLE_VENUES, SAMPLE_VENDORS, SAMPLE_DECORATIONS, SAMPLE_CATERERS

async def seed_database(db):
    """Seed database with sample data"""
    # Clear existing sample data
    await db.venues.delete_many({})
    await db.vendors.delete_many({})
    await db.decorations.delete_many({})
    await db.caterers.delete_many({})
    
    # Insert sample data
    await db.venues.insert_many(SAMPLE_VENUES)
    await db.vendors.insert_many(SAMPLE_VENDORS)
    await db.decorations.insert_many(SAMPLE_DECORATIONS)
    await db.caterers.insert_many(SAMPLE_CATERERS)
    
    return {
        "success": True,
        "message": "Sample data seeded successfully",
        "counts": {
            "venues": len(SAMPLE_VENUES),
            "vendors": len(SAMPLE_VENDORS),
            "decorations": len(SAMPLE_DECORATIONS),
            "caterers": len(SAMPLE_CATERERS)
        }
    }


# Endpoint definitions to add to server.py:
"""
# Reviews Endpoints
@api_router.post("/reviews")
async def create_review(review: Review):
    review_dict = review.model_dump(exclude={'id'})
    result = await db.reviews.insert_one(review_dict)
    review_dict["_id"] = str(result.inserted_id)
    return review_dict


@api_router.get("/reviews/{item_id}")
async def get_reviews(item_id: str):
    reviews = await db.reviews.find({"item_id": item_id}).to_list(100)
    for review in reviews:
        review["_id"] = str(review["_id"])
    return reviews


# Availability Endpoints
@api_router.get("/availability/{item_id}")
async def get_availability(item_id: str):
    availability = await db.availability.find_one({"item_id": item_id})
    if not availability:
        return {"item_id": item_id, "available_dates": [], "booked_dates": []}
    availability["_id"] = str(availability["_id"])
    return availability


@api_router.post("/availability")
async def update_availability(availability: Availability):
    existing = await db.availability.find_one({"item_id": availability.item_id})
    
    if existing:
        await db.availability.update_one(
            {"item_id": availability.item_id},
            {"$set": availability.model_dump(exclude={'id'})}
        )
        return {"message": "Availability updated"}
    else:
        result = await db.availability.insert_one(availability.model_dump(exclude={'id'}))
        return {"message": "Availability created", "id": str(result.inserted_id)}


# Contact Invitations
@api_router.post("/invitations/send")
async def send_invitations(contact_data: InvitationContact):
    contact_dict = contact_data.model_dump(exclude={'id'})
    result = await db.invitation_contacts.insert_one(contact_dict)
    return {
        "success": True,
        "message": f"Invitations sent to {len(contact_data.contacts)} contacts",
        "id": str(result.inserted_id)
    }


@api_router.get("/invitations/sent/{user_id}")
async def get_sent_invitations(user_id: str):
    invitations = await db.invitation_contacts.find({"user_id": user_id}).to_list(100)
    for invitation in invitations:
        invitation["_id"] = str(invitation["_id"])
    return invitations


# Seed Data Endpoint
@api_router.post("/seed-data")
async def seed_sample_data():
    from seed_and_extensions import seed_database
    return await seed_database(db)
"""
