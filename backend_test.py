#!/usr/bin/env python3
"""
WedPlanner AI Backend API Testing Suite
Tests all backend endpoints with comprehensive scenarios
"""

import requests
import json
import time
import sys
from datetime import datetime
from typing import Dict, Any, Optional

# Configuration
BASE_URL = "https://bride-blueprint.preview.emergentagent.com/api"
TIMEOUT = 60  # Increased timeout for AI endpoints

class WedPlannerAPITester:
    def __init__(self):
        self.base_url = BASE_URL
        self.session = requests.Session()
        self.test_results = []
        self.user_id = None
        self.token = None
        
    def log_test(self, test_name: str, success: bool, details: str = "", response_data: Any = None):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat(),
            "response_data": response_data
        }
        self.test_results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"    Details: {details}")
        if not success and response_data:
            print(f"    Response: {response_data}")
        print()

    def make_request(self, method: str, endpoint: str, data: Dict = None, params: Dict = None, timeout: int = TIMEOUT) -> tuple:
        """Make HTTP request with error handling"""
        url = f"{self.base_url}{endpoint}"
        
        try:
            if method.upper() == "GET":
                response = requests.get(url, params=params, timeout=timeout)
            elif method.upper() == "POST":
                response = requests.post(url, json=data, timeout=timeout)
            elif method.upper() == "PUT":
                response = requests.put(url, json=data, timeout=timeout)
            elif method.upper() == "DELETE":
                response = requests.delete(url, timeout=timeout)
            else:
                return False, f"Unsupported method: {method}"
                
            return True, response
            
        except requests.exceptions.Timeout:
            return False, f"Request timeout after {timeout}s"
        except requests.exceptions.ConnectionError:
            return False, "Connection error - backend may be down"
        except Exception as e:
            return False, f"Request failed: {str(e)}"

    def test_health_check(self):
        """Test API health check"""
        success, response = self.make_request("GET", "/")
        
        if not success:
            self.log_test("Health Check", False, response)
            return False
            
        if response.status_code == 200:
            data = response.json()
            if data.get("status") == "running":
                self.log_test("Health Check", True, "API is running")
                return True
            else:
                self.log_test("Health Check", False, f"Unexpected response: {data}")
                return False
        else:
            self.log_test("Health Check", False, f"Status code: {response.status_code}")
            return False

    def test_send_otp(self):
        """Test OTP sending"""
        test_data = {
            "phone": "+919876543210"
        }
        
        success, response = self.make_request("POST", "/auth/send-otp", test_data)
        
        if not success:
            self.log_test("Send OTP", False, response)
            return False
            
        if response.status_code == 200:
            data = response.json()
            if data.get("success") and data.get("otp") == "123456":
                self.log_test("Send OTP", True, "Mock OTP sent successfully")
                return True
            else:
                self.log_test("Send OTP", False, f"Unexpected response: {data}")
                return False
        else:
            self.log_test("Send OTP", False, f"Status code: {response.status_code}, Response: {response.text}")
            return False

    def test_verify_otp(self):
        """Test OTP verification and user creation"""
        test_data = {
            "phone": "+919876543210",
            "otp": "123456"
        }
        
        success, response = self.make_request("POST", "/auth/verify-otp", test_data)
        
        if not success:
            self.log_test("Verify OTP", False, response)
            return False
            
        if response.status_code == 200:
            data = response.json()
            if data.get("user_id") and data.get("token"):
                self.user_id = data["user_id"]
                self.token = data["token"]
                self.log_test("Verify OTP", True, f"User authenticated, ID: {self.user_id}")
                return True
            else:
                self.log_test("Verify OTP", False, f"Missing user_id or token: {data}")
                return False
        else:
            self.log_test("Verify OTP", False, f"Status code: {response.status_code}, Response: {response.text}")
            return False

    def test_invalid_otp(self):
        """Test invalid OTP verification"""
        test_data = {
            "phone": "+919876543210",
            "otp": "000000"
        }
        
        success, response = self.make_request("POST", "/auth/verify-otp", test_data)
        
        if not success:
            self.log_test("Invalid OTP Test", False, response)
            return False
            
        if response.status_code == 400:
            self.log_test("Invalid OTP Test", True, "Correctly rejected invalid OTP")
            return True
        else:
            self.log_test("Invalid OTP Test", False, f"Should have returned 400, got: {response.status_code}")
            return False

    def test_wedding_setup(self):
        """Test wedding setup creation and retrieval"""
        if not self.user_id:
            self.log_test("Wedding Setup", False, "No user_id available")
            return False
            
        # Create wedding setup
        setup_data = {
            "user_id": self.user_id,
            "wedding_type": "destination",
            "guest_count": 150,
            "budget": 500000.0,
            "wedding_date": "2024-12-15",
            "location": "Goa, India"
        }
        
        success, response = self.make_request("POST", "/wedding-setup", setup_data)
        
        if not success:
            self.log_test("Wedding Setup Creation", False, response)
            return False
            
        if response.status_code == 200:
            data = response.json()
            if data.get("user_id") == self.user_id:
                self.log_test("Wedding Setup Creation", True, "Wedding setup created successfully")
                
                # Test retrieval
                success, get_response = self.make_request("GET", f"/wedding-setup/{self.user_id}")
                
                if success and get_response.status_code == 200:
                    get_data = get_response.json()
                    if get_data.get("user_id") == self.user_id and get_data.get("wedding_type") == "destination":
                        self.log_test("Wedding Setup Retrieval", True, "Wedding setup retrieved successfully")
                        return True
                    else:
                        self.log_test("Wedding Setup Retrieval", False, f"Data mismatch: {get_data}")
                        return False
                else:
                    self.log_test("Wedding Setup Retrieval", False, f"Failed to retrieve: {get_response.status_code if success else response}")
                    return False
            else:
                self.log_test("Wedding Setup Creation", False, f"Unexpected response: {data}")
                return False
        else:
            self.log_test("Wedding Setup Creation", False, f"Status code: {response.status_code}, Response: {response.text}")
            return False

    def test_venues_api(self):
        """Test venues CRUD operations"""
        # Create a venue first
        venue_data = {
            "name": "Royal Palace Gardens",
            "description": "Luxurious outdoor venue with beautiful gardens",
            "location": "Mumbai, Maharashtra",
            "price_range": "Premium",
            "price_per_event": 250000.0,
            "capacity": 200,
            "venue_type": "outdoor",
            "rating": 4.8,
            "images": ["base64_image_1", "base64_image_2"],
            "amenities": ["Parking", "AC", "Catering Kitchen", "Sound System"],
            "available_dates": ["2024-12-15", "2024-12-20", "2024-12-25"]
        }
        
        success, response = self.make_request("POST", "/venues", venue_data)
        
        if not success:
            self.log_test("Create Venue", False, response)
            return False
            
        if response.status_code == 200:
            data = response.json()
            venue_id = data.get("_id")
            if venue_id and data.get("name") == "Royal Palace Gardens":
                self.log_test("Create Venue", True, f"Venue created with ID: {venue_id}")
                
                # Test get all venues
                success, get_response = self.make_request("GET", "/venues")
                if success and get_response.status_code == 200:
                    venues = get_response.json()
                    if isinstance(venues, list) and len(venues) > 0:
                        self.log_test("Get All Venues", True, f"Retrieved {len(venues)} venues")
                    else:
                        self.log_test("Get All Venues", False, f"No venues returned: {venues}")
                        return False
                else:
                    self.log_test("Get All Venues", False, f"Failed to get venues: {get_response.status_code if success else get_response}")
                    return False
                
                # Test get specific venue
                success, get_one_response = self.make_request("GET", f"/venues/{venue_id}")
                if success and get_one_response.status_code == 200:
                    venue_detail = get_one_response.json()
                    if venue_detail.get("name") == "Royal Palace Gardens":
                        self.log_test("Get Specific Venue", True, "Venue details retrieved successfully")
                    else:
                        self.log_test("Get Specific Venue", False, f"Venue data mismatch: {venue_detail}")
                        return False
                else:
                    self.log_test("Get Specific Venue", False, f"Failed to get venue: {get_one_response.status_code if success else get_one_response}")
                    return False
                
                # Test venue filtering
                success, filter_response = self.make_request("GET", "/venues", params={"min_capacity": 150, "location": "Mumbai"})
                if success and filter_response.status_code == 200:
                    filtered_venues = filter_response.json()
                    if isinstance(filtered_venues, list):
                        self.log_test("Venue Filtering", True, f"Filtered venues returned: {len(filtered_venues)}")
                        return True
                    else:
                        self.log_test("Venue Filtering", False, f"Invalid filter response: {filtered_venues}")
                        return False
                else:
                    self.log_test("Venue Filtering", False, f"Filter request failed: {filter_response.status_code if success else filter_response}")
                    return False
            else:
                self.log_test("Create Venue", False, f"Unexpected response: {data}")
                return False
        else:
            self.log_test("Create Venue", False, f"Status code: {response.status_code}, Response: {response.text}")
            return False

    def test_decorations_api(self):
        """Test decorations CRUD operations"""
        # Create decoration
        decoration_data = {
            "theme_name": "Royal Gold Theme",
            "description": "Elegant gold and cream decoration with royal touch",
            "price": 75000.0,
            "images": ["base64_decoration_1", "base64_decoration_2"],
            "includes": ["Stage Decoration", "Mandap", "Flower Arrangements", "Lighting"],
            "customization_options": {
                "color_scheme": ["Gold & Cream", "Red & Gold", "Pink & Gold"],
                "flower_types": ["Roses", "Marigolds", "Jasmine"],
                "lighting": ["Warm", "Cool", "Colorful"]
            }
        }
        
        success, response = self.make_request("POST", "/decorations", decoration_data)
        
        if not success:
            self.log_test("Create Decoration", False, response)
            return False
            
        if response.status_code == 200:
            data = response.json()
            decoration_id = data.get("_id")
            if decoration_id and data.get("theme_name") == "Royal Gold Theme":
                self.log_test("Create Decoration", True, f"Decoration created with ID: {decoration_id}")
                
                # Test get all decorations
                success, get_response = self.make_request("GET", "/decorations")
                if success and get_response.status_code == 200:
                    decorations = get_response.json()
                    if isinstance(decorations, list) and len(decorations) > 0:
                        self.log_test("Get All Decorations", True, f"Retrieved {len(decorations)} decorations")
                    else:
                        self.log_test("Get All Decorations", False, f"No decorations returned: {decorations}")
                        return False
                else:
                    self.log_test("Get All Decorations", False, f"Failed to get decorations: {get_response.status_code if success else get_response}")
                    return False
                
                # Test get specific decoration
                success, get_one_response = self.make_request("GET", f"/decorations/{decoration_id}")
                if success and get_one_response.status_code == 200:
                    decoration_detail = get_one_response.json()
                    if decoration_detail.get("theme_name") == "Royal Gold Theme":
                        self.log_test("Get Specific Decoration", True, "Decoration details retrieved successfully")
                        return True
                    else:
                        self.log_test("Get Specific Decoration", False, f"Decoration data mismatch: {decoration_detail}")
                        return False
                else:
                    self.log_test("Get Specific Decoration", False, f"Failed to get decoration: {get_one_response.status_code if success else get_one_response}")
                    return False
            else:
                self.log_test("Create Decoration", False, f"Unexpected response: {data}")
                return False
        else:
            self.log_test("Create Decoration", False, f"Status code: {response.status_code}, Response: {response.text}")
            return False

    def test_catering_api(self):
        """Test catering CRUD operations and menu selection"""
        # Create caterer
        caterer_data = {
            "name": "Spice Garden Catering",
            "description": "Premium Indian cuisine catering service",
            "cuisine_types": ["North Indian", "South Indian", "Continental"],
            "price_per_plate": 850.0,
            "rating": 4.7,
            "images": ["base64_caterer_1", "base64_caterer_2"],
            "menu_items": [
                {
                    "name": "Paneer Butter Masala",
                    "category": "main",
                    "price_per_plate": 120.0,
                    "cuisine_type": "North Indian",
                    "is_vegetarian": True
                },
                {
                    "name": "Chicken Biryani",
                    "category": "main",
                    "price_per_plate": 180.0,
                    "cuisine_type": "North Indian",
                    "is_vegetarian": False
                },
                {
                    "name": "Gulab Jamun",
                    "category": "dessert",
                    "price_per_plate": 50.0,
                    "cuisine_type": "North Indian",
                    "is_vegetarian": True
                }
            ]
        }
        
        success, response = self.make_request("POST", "/caterers", caterer_data)
        
        if not success:
            self.log_test("Create Caterer", False, response)
            return False
            
        if response.status_code == 200:
            data = response.json()
            caterer_id = data.get("_id")
            if caterer_id and data.get("name") == "Spice Garden Catering":
                self.log_test("Create Caterer", True, f"Caterer created with ID: {caterer_id}")
                
                # Test get all caterers
                success, get_response = self.make_request("GET", "/caterers")
                if success and get_response.status_code == 200:
                    caterers = get_response.json()
                    if isinstance(caterers, list) and len(caterers) > 0:
                        self.log_test("Get All Caterers", True, f"Retrieved {len(caterers)} caterers")
                    else:
                        self.log_test("Get All Caterers", False, f"No caterers returned: {caterers}")
                        return False
                else:
                    self.log_test("Get All Caterers", False, f"Failed to get caterers: {get_response.status_code if success else get_response}")
                    return False
                
                # Test menu selection
                if self.user_id:
                    menu_selection_data = {
                        "user_id": self.user_id,
                        "caterer_id": caterer_id,
                        "selected_items": ["Paneer Butter Masala", "Chicken Biryani", "Gulab Jamun"],
                        "total_guests": 150,
                        "total_price": 52500.0
                    }
                    
                    success, menu_response = self.make_request("POST", "/menu-selection", menu_selection_data)
                    if success and menu_response.status_code == 200:
                        menu_data = menu_response.json()
                        if menu_data.get("user_id") == self.user_id:
                            self.log_test("Menu Selection", True, "Menu selection saved successfully")
                            return True
                        else:
                            self.log_test("Menu Selection", False, f"Menu selection data mismatch: {menu_data}")
                            return False
                    else:
                        self.log_test("Menu Selection", False, f"Menu selection failed: {menu_response.status_code if success else menu_response}")
                        return False
                else:
                    self.log_test("Menu Selection", False, "No user_id available for menu selection")
                    return False
            else:
                self.log_test("Create Caterer", False, f"Unexpected response: {data}")
                return False
        else:
            self.log_test("Create Caterer", False, f"Status code: {response.status_code}, Response: {response.text}")
            return False

    def test_vendors_api(self):
        """Test vendors CRUD operations with category filtering"""
        # Create vendor
        vendor_data = {
            "name": "Capture Moments Photography",
            "category": "photographer",
            "description": "Professional wedding photography and videography",
            "price_range": "₹50,000 - ₹1,50,000",
            "rating": 4.9,
            "portfolio_images": ["base64_portfolio_1", "base64_portfolio_2"],
            "services": ["Pre-wedding Shoot", "Wedding Photography", "Videography", "Album Creation"],
            "available_dates": ["2024-12-15", "2024-12-20", "2024-12-25"],
            "contact": "+919876543211"
        }
        
        success, response = self.make_request("POST", "/vendors", vendor_data)
        
        if not success:
            self.log_test("Create Vendor", False, response)
            return False
            
        if response.status_code == 200:
            data = response.json()
            vendor_id = data.get("_id")
            if vendor_id and data.get("name") == "Capture Moments Photography":
                self.log_test("Create Vendor", True, f"Vendor created with ID: {vendor_id}")
                
                # Test get all vendors
                success, get_response = self.make_request("GET", "/vendors")
                if success and get_response.status_code == 200:
                    vendors = get_response.json()
                    if isinstance(vendors, list) and len(vendors) > 0:
                        self.log_test("Get All Vendors", True, f"Retrieved {len(vendors)} vendors")
                    else:
                        self.log_test("Get All Vendors", False, f"No vendors returned: {vendors}")
                        return False
                else:
                    self.log_test("Get All Vendors", False, f"Failed to get vendors: {get_response.status_code if success else get_response}")
                    return False
                
                # Test category filtering
                success, filter_response = self.make_request("GET", "/vendors", params={"category": "photographer"})
                if success and filter_response.status_code == 200:
                    filtered_vendors = filter_response.json()
                    if isinstance(filtered_vendors, list) and len(filtered_vendors) > 0:
                        photographer_found = any(v.get("category") == "photographer" for v in filtered_vendors)
                        if photographer_found:
                            self.log_test("Vendor Category Filtering", True, f"Found {len(filtered_vendors)} photographers")
                            return True
                        else:
                            self.log_test("Vendor Category Filtering", False, "No photographers found in filtered results")
                            return False
                    else:
                        self.log_test("Vendor Category Filtering", False, f"No filtered vendors returned: {filtered_vendors}")
                        return False
                else:
                    self.log_test("Vendor Category Filtering", False, f"Filter request failed: {filter_response.status_code if success else filter_response}")
                    return False
            else:
                self.log_test("Create Vendor", False, f"Unexpected response: {data}")
                return False
        else:
            self.log_test("Create Vendor", False, f"Status code: {response.status_code}, Response: {response.text}")
            return False

    def test_bookings_api(self):
        """Test bookings creation and retrieval"""
        if not self.user_id:
            self.log_test("Bookings API", False, "No user_id available")
            return False
            
        # Create booking
        booking_data = {
            "user_id": self.user_id,
            "booking_type": "venue",
            "item_id": "venue_123",
            "booking_date": "2024-12-15",
            "amount": 250000.0,
            "payment_status": "pending"
        }
        
        success, response = self.make_request("POST", "/bookings", booking_data)
        
        if not success:
            self.log_test("Create Booking", False, response)
            return False
            
        if response.status_code == 200:
            data = response.json()
            booking_id = data.get("_id")
            if booking_id and data.get("user_id") == self.user_id:
                self.log_test("Create Booking", True, f"Booking created with ID: {booking_id}")
                
                # Test get user bookings
                success, get_response = self.make_request("GET", f"/bookings/{self.user_id}")
                if success and get_response.status_code == 200:
                    bookings = get_response.json()
                    if isinstance(bookings, list) and len(bookings) > 0:
                        user_booking_found = any(b.get("user_id") == self.user_id for b in bookings)
                        if user_booking_found:
                            self.log_test("Get User Bookings", True, f"Retrieved {len(bookings)} bookings for user")
                            return True
                        else:
                            self.log_test("Get User Bookings", False, "No bookings found for user")
                            return False
                    else:
                        self.log_test("Get User Bookings", False, f"No bookings returned: {bookings}")
                        return False
                else:
                    self.log_test("Get User Bookings", False, f"Failed to get bookings: {get_response.status_code if success else get_response}")
                    return False
            else:
                self.log_test("Create Booking", False, f"Unexpected response: {data}")
                return False
        else:
            self.log_test("Create Booking", False, f"Status code: {response.status_code}, Response: {response.text}")
            return False

    def test_budget_api(self):
        """Test budget calculation"""
        if not self.user_id:
            self.log_test("Budget API", False, "No user_id available")
            return False
            
        success, response = self.make_request("GET", f"/budget/{self.user_id}")
        
        if not success:
            self.log_test("Budget Calculation", False, response)
            return False
            
        if response.status_code == 200:
            data = response.json()
            expected_keys = ["venue", "decoration", "catering", "vendors", "total"]
            if all(key in data for key in expected_keys):
                self.log_test("Budget Calculation", True, f"Budget calculated: Total ₹{data.get('total', 0)}")
                return True
            else:
                self.log_test("Budget Calculation", False, f"Missing budget keys: {data}")
                return False
        else:
            self.log_test("Budget Calculation", False, f"Status code: {response.status_code}, Response: {response.text}")
            return False

    def test_payment_api(self):
        """Test payment order creation (mocked)"""
        if not self.user_id:
            self.log_test("Payment API", False, "No user_id available")
            return False
            
        payment_data = {
            "user_id": self.user_id,
            "booking_id": "booking_123",
            "amount": 250000.0
        }
        
        success, response = self.make_request("POST", "/payment/create-order", payment_data)
        
        if not success:
            self.log_test("Payment Order Creation", False, response)
            return False
            
        if response.status_code == 200:
            data = response.json()
            if data.get("success") and data.get("order_id") and data.get("amount") == 250000.0:
                self.log_test("Payment Order Creation", True, f"Payment order created: {data.get('order_id')}")
                return True
            else:
                self.log_test("Payment Order Creation", False, f"Unexpected response: {data}")
                return False
        else:
            self.log_test("Payment Order Creation", False, f"Status code: {response.status_code}, Response: {response.text}")
            return False

    def test_ai_wedding_planner(self):
        """Test AI wedding planner (may take 10-30s)"""
        print("🤖 Testing AI Wedding Planner (this may take 10-30 seconds)...")
        
        ai_request_data = {
            "user_input": "I want a traditional Indian wedding with royal theme, good food, and beautiful decorations",
            "guest_count": 200,
            "budget": 800000.0,
            "location": "Jaipur, Rajasthan"
        }
        
        success, response = self.make_request("POST", "/ai/wedding-plan", ai_request_data, timeout=60)
        
        if not success:
            self.log_test("AI Wedding Planner", False, response)
            return False
            
        if response.status_code == 200:
            data = response.json()
            if data.get("success") and data.get("recommendations"):
                self.log_test("AI Wedding Planner", True, "AI recommendations generated successfully")
                return True
            else:
                self.log_test("AI Wedding Planner", False, f"Unexpected AI response: {data}")
                return False
        else:
            self.log_test("AI Wedding Planner", False, f"Status code: {response.status_code}, Response: {response.text}")
            return False

    def test_ai_invitation_generator(self):
        """Test AI invitation generator (may take 30-60s)"""
        print("🎨 Testing AI Invitation Generator (this may take 30-60 seconds)...")
        
        invitation_data = {
            "couple_names": "Arjun & Priya",
            "wedding_date": "December 15, 2024",
            "venue": "Royal Palace Gardens, Mumbai",
            "message": "Join us as we begin our journey together",
            "theme": "royal"
        }
        
        success, response = self.make_request("POST", "/ai/generate-invitation", invitation_data, timeout=90)
        
        if not success:
            self.log_test("AI Invitation Generator", False, response)
            return False
            
        if response.status_code == 200:
            data = response.json()
            if data.get("success") and data.get("image_base64") and data.get("invitation_id"):
                image_size = len(data.get("image_base64", ""))
                self.log_test("AI Invitation Generator", True, f"Invitation generated successfully (Image size: {image_size} chars)")
                return True
            else:
                self.log_test("AI Invitation Generator", False, f"Unexpected AI response: {data}")
                return False
        else:
            self.log_test("AI Invitation Generator", False, f"Status code: {response.status_code}, Response: {response.text}")
            return False

    def run_all_tests(self):
        """Run all API tests in sequence"""
        print("🚀 Starting WedPlanner AI Backend API Tests")
        print(f"🌐 Base URL: {self.base_url}")
        print("=" * 60)
        
        # Test sequence
        tests = [
            ("Health Check", self.test_health_check),
            ("Send OTP", self.test_send_otp),
            ("Verify OTP", self.test_verify_otp),
            ("Invalid OTP", self.test_invalid_otp),
            ("Wedding Setup", self.test_wedding_setup),
            ("Venues API", self.test_venues_api),
            ("Decorations API", self.test_decorations_api),
            ("Catering API", self.test_catering_api),
            ("Vendors API", self.test_vendors_api),
            ("Bookings API", self.test_bookings_api),
            ("Budget API", self.test_budget_api),
            ("Payment API", self.test_payment_api),
            ("AI Wedding Planner", self.test_ai_wedding_planner),
            ("AI Invitation Generator", self.test_ai_invitation_generator),
        ]
        
        passed = 0
        failed = 0
        
        for test_name, test_func in tests:
            try:
                if test_func():
                    passed += 1
                else:
                    failed += 1
            except Exception as e:
                self.log_test(test_name, False, f"Test exception: {str(e)}")
                failed += 1
        
        print("=" * 60)
        print(f"📊 Test Results Summary:")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"📈 Success Rate: {(passed/(passed+failed)*100):.1f}%")
        
        return passed, failed, self.test_results

if __name__ == "__main__":
    tester = WedPlannerAPITester()
    passed, failed, results = tester.run_all_tests()
    
    # Exit with error code if any tests failed
    sys.exit(0 if failed == 0 else 1)