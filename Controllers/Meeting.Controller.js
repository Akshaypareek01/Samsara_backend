import { Meeting } from "../Models/Meeting.Model.js";


export const createMeeting =  async (req, res) => {
  try {
    const {
      meetingName,
      title,
      duration,
      meetingId,
      meetingPassword,
      hostName,
      teacherName,
    } = req.body;

    // Save meeting details to the database
    const newMeeting = new Meeting({
      meetingName,
      title,
      duration,
      meetingId,
      meetingPassword,
      hostName,
      teacherName,
    });
    
    await newMeeting.save();

    res.status(201).json({ message: 'Meeting created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}


export const getMeetingData= async (req, res) => {
    try {
      const { meetingId } = req.params;
  
      // Retrieve meeting details from the database
      const meeting = await Meeting.find();
  
      if (!meeting) {
        return res.status(404).json({ error: 'Meeting not found' });
      }
  
      res.status(200).json({ meeting });
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }


  
