// utils/api.ts
import axios from 'axios';

const API_BASE_URL = 'https://golden-goblin-master.ngrok-free.app/api/auth';

export async function registerUser(userData: {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  password: string;
}) {
  try {
    const response = await axios.post(`${API_BASE_URL}/register`, userData, {
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
    const response = await axios.post(`${API_BASE_URL}/login`, userData, {
      withCredentials: true,
    });
    return response.data; // Handle the tokens or any data returned
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
}
