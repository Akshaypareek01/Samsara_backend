// controllers/eventController.js

import axios from "axios";
import Event from "../Models/Event.Model.js";


// Create a new event
export const createEvent = async (req, res) => {
    console.log("body events  ==>",req.body)
    try {
        const event = new Event(req.body);
        await event.save();
        res.status(201).json(event);
    } catch (error) {
        console.log("error  ==<.",error)
        res.status(500).json({ error: error.message });
    }
};

// Get event by ID
export const getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.status(200).json(event);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all events
export const getAllEvents = async (req, res) => {
    try {
        const events = await Event.find();
        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update event
export const updateEvent = async (req, res) => {
    try {
        const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.status(200).json(event);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete event
export const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.status(200).json({ message: 'Event deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


const updateClassMeetingInfo = async (classId, newMeetingNumber, newMeetingPassword) => {
    try {
      // Find the class by ID
      const foundClass = await Event.findById(classId);
  
      if (!foundClass) {
        throw new Error("Class not found");
      }
  
      // Update meeting number and password
      foundClass.meeting_number = "";
      foundClass.status = false;
      // Save the updated class
      await foundClass.save();
  
      // console.log("Class meeting information updated successfully",foundClass);
    } catch (error) {
      console.error("Error updating class meeting information:", error.message);
      throw error; // You can choose to handle or propagate the error as needed
    }
  };

   const deleteMeeting =async(token,meetingId)=> {
    // console.log("Token ====>",token);
    // console.log("MeetingId ====>",meetingId);
    try {
      const result = await axios.delete("https://api.zoom.us/v2/meetings/" + meetingId, {
        headers: {
          'Authorization': 'Bearer ' + token,
          'User-Agent': 'Zoom-api-Jwt-Request',
          'content-type': 'application/json'
        }
      });
      // console.log("Meeting delete Successfully =======>",result)
      // sendResponse.setSuccess(200, 'Success', result.data);
      return result;
    } catch (error) {
      console.log(error);
     
    }
  }

 export const EndEventMeeting = async (req, res) => {
    const { classId } = req.params;
    const {token,meetingId} = req.body;
    try {
      updateClassMeetingInfo(classId);
      // console.log("End meeting ====>",token,"ID ==================>",meetingId)
      deleteMeeting(token,meetingId);
      res.json({ success: true, message:"Metting End" });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  };



  export const registerUserToEvent = async (req, res) => {
    try {
        const { eventId, userId } = req.body;

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        if (!event.students.includes(userId)) {
            event.students.push(userId);
            await event.save();
            return res.status(200).json({ message: 'User registered successfully', event });
        }
        
        res.status(400).json({ message: 'User already registered' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Get all students registered for an event
export const getStudentsForEvent = async (req, res) => {
    try {
        const { eventId } = req.params;

        const event = await Event.findById(eventId).populate('students', 'name email');
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.status(200).json({ students: event.students });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Get all events a user is registered in
export const getUserRegisteredEvents = async (req, res) => {
    try {
        const { userId } = req.params;

        const events = await Event.find({ students: userId });
        res.status(200).json({ events });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
