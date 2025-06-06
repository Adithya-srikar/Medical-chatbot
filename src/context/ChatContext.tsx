import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Message, AppointmentDetails, Doctor, TimeSlot } from '../types';
import { validateUser, createUser, fetchDoctors, fetchTimeSlots, bookAppointment } from '../services/api';

interface ChatContextType {
  messages: Message[];
  appointmentDetails: AppointmentDetails | null;
  isLoading: boolean;
  selectedDoctor: Doctor | null;
  availableTimeSlots: TimeSlot[];
  addMessage: (message: Message) => void;
  sendUserMessage: (text: string) => Promise<void>;
  handlePhoneNumber: (phoneNumber: string) => Promise<void>;
  handleDOB: (dob: string) => Promise<void>;
  handleUserInfo: (firstName: string, lastName: string) => Promise<void>;
  selectDoctor: (doctor: Doctor) => Promise<void>;
  selectDate: (date: string) => Promise<void>;
  selectTimeSlot: (timeSlot: TimeSlot) => Promise<void>;
  confirmAppointment: (reason: string) => Promise<void>;
  resetChat: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Welcome to our medical appointment booking service! To get started, please provide your phone number.',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  
  const [appointmentDetails, setAppointmentDetails] = useState<AppointmentDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const [userPhone, setUserPhone] = useState<string>('');
  const [userDOB, setUserDOB] = useState<string>('');

  const addMessage = (message: Message) => {
    setMessages((prevMessages) => [...prevMessages, message]);
  };

  const sendBotMessage = async (text: string, options?: any[]) => {
    const botMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'bot',
      timestamp: new Date(),
      options
    };
    addMessage(botMessage);
    return botMessage;
  };

  const handlePhoneNumber = async (phoneNumber: string) => {
    setIsLoading(true);
    setUserPhone(phoneNumber);
    await sendBotMessage('Thank you. Now, please provide your date of birth (YYYY-MM-DD).');
    setIsLoading(false);
  };

  const handleDOB = async (dob: string) => {
    setIsLoading(true);
    setUserDOB(dob);
    
    try {
      const response = await validateUser(userPhone, dob);
      
      if (response.message === 'patient exists') {
        await sendBotMessage('Welcome back! I can help you schedule an appointment. What type of appointment would you like to book?');
        await startBookingFlow();
      } else {
        await sendBotMessage('I see you\'re new here. Please provide your first name.');
      }
    } catch (error) {
      await sendBotMessage('Sorry, there was an error validating your information. Please try again.');
      resetChat();
    }
    
    setIsLoading(false);
  };

  const handleUserInfo = async (firstName: string, lastName: string) => {
    setIsLoading(true);
    
    try {
      await createUser(firstName, lastName, userPhone, userDOB);
      await sendBotMessage(`Thank you, ${firstName}! Let's schedule your appointment. What type of appointment would you like to book?`);
      await startBookingFlow();
    } catch (error) {
      await sendBotMessage('Sorry, there was an error creating your account. Please try again.');
      resetChat();
    }
    
    setIsLoading(false);
  };

  const startBookingFlow = async () => {
    try {
      const doctors = await fetchDoctors();
      
      await sendBotMessage('Here are our available doctors. Please select one:');
      
      const doctorOptions: Message = {
        id: Date.now().toString(),
        text: 'Select a doctor',
        sender: 'bot',
        timestamp: new Date(),
        options: doctors.map(doctor => ({
          id: doctor.id,
          text: `${doctor.name} - ${doctor.specialty}`,
          value: doctor.id,
          action: 'select-doctor'
        }))
      };
      
      addMessage(doctorOptions);
    } catch (error) {
      await sendBotMessage('Sorry, I couldn\'t fetch the list of doctors. Please try again later.');
    }
  };

  const sendUserMessage = async (text: string) => {
    setIsLoading(true);
    
    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date(),
    };
    
    addMessage(userMessage);
    
    // Process user message based on context
    const lastBotMessage = messages.filter(m => m.sender === 'bot').pop();
    
    if (lastBotMessage?.text.includes('phone number')) {
      await handlePhoneNumber(text);
    } else if (lastBotMessage?.text.includes('date of birth')) {
      await handleDOB(text);
    } else if (lastBotMessage?.text.includes('first name')) {
      await sendBotMessage('Great! And your last name?');
    } else if (lastBotMessage?.text.includes('last name')) {
      const firstName = messages[messages.length - 3].text;
      await handleUserInfo(firstName, text);
    }
    
    setIsLoading(false);
  };

  const selectDoctor = async (doctor: Doctor) => {
    setIsLoading(true);
    setSelectedDoctor(doctor);
    
    await sendBotMessage(`You've selected Dr. ${doctor.name}. Great choice!`);
    
    // Ask for date
    const today = new Date();
    const dateOptions = [];
    
    // Generate next 7 days as options
    for (let i = 1; i <= 7; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
      
      const formattedDate = date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      });
      
      const dateString = date.toISOString().split('T')[0];
      
      dateOptions.push({
        id: dateString,
        text: formattedDate,
        value: dateString,
        action: 'select-date'
      });
    }
    
    await sendBotMessage('Please select a date for your appointment:');
    
    const dateMessage: Message = {
      id: Date.now().toString(),
      text: 'Select a date',
      sender: 'bot',
      timestamp: new Date(),
      options: dateOptions
    };
    
    addMessage(dateMessage);
    setIsLoading(false);
  };

  const selectDate = async (date: string) => {
    setIsLoading(true);
    setSelectedDate(date);
    
    const formattedDate = new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
    
    await sendBotMessage(`You've selected ${formattedDate}. Let me check the available time slots.`);
    
    try {
      const timeSlots = await fetchTimeSlots(selectedDoctor!.id, date);
      setAvailableTimeSlots(timeSlots);
      
      await sendBotMessage('Here are the available time slots:');
      
      const timeSlotMessage: Message = {
        id: Date.now().toString(),
        text: 'Select a time',
        sender: 'bot',
        timestamp: new Date(),
        options: timeSlots.map(slot => ({
          id: slot.id,
          text: slot.time,
          value: slot.id,
          action: 'select-time'
        }))
      };
      
      addMessage(timeSlotMessage);
    } catch (error) {
      await sendBotMessage('Sorry, I couldn\'t fetch the available time slots. Please try again later.');
    }
    
    setIsLoading(false);
  };

  const selectTimeSlot = async (timeSlot: TimeSlot) => {
    setIsLoading(true);
    
    await sendBotMessage(`You've selected ${timeSlot.time}.`);
    await sendBotMessage('Finally, please tell me the reason for your visit in a few words.');
    
    setAppointmentDetails({
      doctorId: selectedDoctor!.id,
      doctorName: selectedDoctor!.name,
      date: selectedDate!,
      timeSlot: timeSlot,
      reason: ''
    });
    
    setIsLoading(false);
  };

  const confirmAppointment = async (reason: string) => {
    setIsLoading(true);
    
    if (!appointmentDetails) {
      await sendBotMessage('Sorry, there was an issue with your appointment details. Let\'s start over.');
      resetChat();
      setIsLoading(false);
      return;
    }
    
    const updatedAppointmentDetails = {
      ...appointmentDetails,
      reason
    };
    
    setAppointmentDetails(updatedAppointmentDetails);
    
    await sendBotMessage(`Thank you. Here's a summary of your appointment:`);
    
    const formattedDate = new Date(updatedAppointmentDetails.date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
    
    const summaryText = `
      Doctor: ${updatedAppointmentDetails.doctorName}
      Date: ${formattedDate}
      Time: ${updatedAppointmentDetails.timeSlot.time}
      Reason: ${updatedAppointmentDetails.reason}
    `;
    
    await sendBotMessage(summaryText);
    
    const confirmMessage: Message = {
      id: Date.now().toString(),
      text: 'Would you like to confirm this appointment?',
      sender: 'bot',
      timestamp: new Date(),
      options: [
        {
          id: 'confirm-yes',
          text: 'Yes, confirm appointment',
          value: 'yes',
          action: 'confirm-appointment'
        },
        {
          id: 'confirm-no',
          text: 'No, start over',
          value: 'no',
          action: 'reset-chat'
        }
      ]
    };
    
    addMessage(confirmMessage);
    setIsLoading(false);
  };

  const resetChat = () => {
    setMessages([
      {
        id: '1',
        text: 'Welcome to our medical appointment booking service! To get started, please provide your phone number.',
        sender: 'bot',
        timestamp: new Date(),
      },
    ]);
    setAppointmentDetails(null);
    setSelectedDoctor(null);
    setSelectedDate(null);
    setAvailableTimeSlots([]);
    setUserPhone('');
    setUserDOB('');
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        appointmentDetails,
        isLoading,
        selectedDoctor,
        availableTimeSlots,
        addMessage,
        sendUserMessage,
        handlePhoneNumber,
        handleDOB,
        handleUserInfo,
        selectDoctor,
        selectDate,
        selectTimeSlot,
        confirmAppointment,
        resetChat
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};