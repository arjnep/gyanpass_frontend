// utils/api.ts
import axios from 'axios';

export async function registerUser(userData: {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  password: string;
}) {
  try {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_API_URL}/auth/register`, userData, {
      withCredentials: true, // This allows the backend to set cookies
    });
    return response.data; // Handle the tokens or any data returned
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
}

export async function loginUser(userData: {
  email: string;
  password: string;
}) {
  try {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_API_URL}/auth/login`, userData, {
      withCredentials: true,
    });
    return response.data; // Handle the tokens or any data returned
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
}
