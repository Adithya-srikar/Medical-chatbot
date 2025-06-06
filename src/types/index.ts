export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  options?: MessageOption[];
}

export interface MessageOption {
  id: string;
  text: string;
  value: string;
  action: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  imageUrl?: string;
}

export interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

export interface AppointmentDetails {
  doctorId: string;
  doctorName: string;
  date: string;
  timeSlot: TimeSlot;
  reason: string;
}