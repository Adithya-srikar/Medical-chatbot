import axios from 'axios';
import { Doctor, TimeSlot, AppointmentDetails } from '../types';

const BASE_URL = 'https://medical-assistant1.onrender.com/Bland';

export const validateUser = async (phoneNumber: string, dob: string) => {
  try {
    const response = await axios.post(`${BASE_URL}/validate-user`, {
      phoneNumber,
      dob
    });
    return response.data;
  } catch (error) {
    console.error('Error validating user:', error);
    throw error;
  }
};

export const createUser = async (firstName: string, lastName: string, phoneNumber: string, dob: string) => {
  try {
    const response = await axios.post(`${BASE_URL}/create-user`, {
      firstName,
      lastName,
      phoneNumber,
      dob
    });
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const fetchDoctors = async (): Promise<Doctor[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/doctors`);
    return response.data;
  } catch (error) {
    console.error('Error fetching doctors:', error);
    throw error;
  }
};

export const fetchTimeSlots = async (doctorId: string, date: string): Promise<TimeSlot[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/timeslots`, {
      params: { doctorId, date }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching time slots:', error);
    throw error;
  }
};

export const bookAppointment = async (appointmentDetails: AppointmentDetails): Promise<{ success: boolean; appointmentId?: string }> => {
  try {
    const response = await axios.post(`${BASE_URL}/appointments`, appointmentDetails);
    return response.data;
  } catch (error) {
    console.error('Error booking appointment:', error);
    throw error;
  }
};