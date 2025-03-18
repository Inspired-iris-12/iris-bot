import axios from "axios";
import { OtpResponse } from "@/interfaces/types";
import { ApiResponse, StreamingApiResponse, IdeaCheckResponse, ConcernCheckResponse } from '@/interfaces/types';

const API_BASE_URL = "http://127.0.0.1:5000"; // Flask server

// OTP APIs
export const FetchOtp = async (email: string) => {
    return axios.post(`${API_BASE_URL}/send-otp`, { email });
};

export const VerifyOtp = async (email: string, otp: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/verify-otp`, { email, otp });
    return response.data as OtpResponse;  // Type assertion here
  } catch (error) {
    throw error;
  }
};

// Project-related APIs
export const submitIdea = async (input: string) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/submit-idea`, { input });

        return response.data;
        
    } catch (error) {
        throw error;
    }
};

export const submitConcern = async (input: string) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/submit-concern`, { input });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const submitFeedback = async (input: string) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/submit-feedback`, { input });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const checkIdea = async (input: string) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/check-idea`, { input });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const checkConcern = async (input: string) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/check-concern`, { input });
        return response.data;
    } catch (error) {
        throw error;
    }
};

