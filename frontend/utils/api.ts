import axios from 'axios';
import Constants from 'expo-constants';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

export const api = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth APIs
export const sendOTP = async (phone: string) => {
  const response = await api.post('/auth/send-otp', { phone });
  return response.data;
};

export const verifyOTP = async (phone: string, otp: string) => {
  const response = await api.post('/auth/verify-otp', { phone, otp });
  return response.data;
};

// Wedding Setup APIs
export const createWeddingSetup = async (setup: any) => {
  const response = await api.post('/wedding-setup', setup);
  return response.data;
};

export const getWeddingSetup = async (userId: string) => {
  const response = await api.get(`/wedding-setup/${userId}`);
  return response.data;
};

// Venue APIs
export const getVenues = async (filters?: any) => {
  const response = await api.get('/venues', { params: filters });
  return response.data;
};

export const getVenueById = async (venueId: string) => {
  const response = await api.get(`/venues/${venueId}`);
  return response.data;
};

// Decoration APIs
export const getDecorations = async () => {
  const response = await api.get('/decorations');
  return response.data;
};

export const getDecorationById = async (decorationId: string) => {
  const response = await api.get(`/decorations/${decorationId}`);
  return response.data;
};

// Catering APIs
export const getCaterers = async () => {
  const response = await api.get('/caterers');
  return response.data;
};

export const getCatererById = async (catererId: string) => {
  const response = await api.get(`/caterers/${catererId}`);
  return response.data;
};

export const saveMenuSelection = async (selection: any) => {
  const response = await api.post('/menu-selection', selection);
  return response.data;
};

// Vendor APIs
export const getVendors = async (category?: string) => {
  const response = await api.get('/vendors', { params: { category } });
  return response.data;
};

export const getVendorById = async (vendorId: string) => {
  const response = await api.get(`/vendors/${vendorId}`);
  return response.data;
};

// Booking APIs
export const createBooking = async (booking: any) => {
  const response = await api.post('/bookings', booking);
  return response.data;
};

export const getUserBookings = async (userId: string) => {
  const response = await api.get(`/bookings/${userId}`);
  return response.data;
};

// AI APIs
export const generateWeddingPlan = async (request: any) => {
  const response = await api.post('/ai/wedding-plan', request);
  return response.data;
};

export const generateInvitation = async (request: any) => {
  const response = await api.post('/ai/generate-invitation', request);
  return response.data;
};

// Payment APIs
export const createPaymentOrder = async (payment: any) => {
  const response = await api.post('/payment/create-order', payment);
  return response.data;
};

// Budget APIs
export const getUserBudget = async (userId: string) => {
  const response = await api.get(`/budget/${userId}`);
  return response.data;
};