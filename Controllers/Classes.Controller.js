import axios from "axios";
import { Class } from "../Models/Class.Model.js";
import { Teacher } from "../Models/Teachers.Model.js";

export const createClass = async (req, res) => {
  try {
    const newClass = await Class.create(req.body);
    res.json({ success: true, data: newClass });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getAllClasses = async (req, res) => {
  try {
    const classes = await Class.find().populate('teacher').exec();
    res.json({ success: true, data: classes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getClassById = async (req, res) => {
  const { classId } = req.params;
  try {
    const foundClass = await Class.findById(classId).populate('teacher').exec();;
    res.json({ success: true, data: foundClass });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateClass = async (req, res) => {
  const { classId } = req.params;
  const updatedData = req.body;
  try {
    const updatedClass = await Class.findByIdAndUpdate(classId, updatedData, { new: true });
    res.json({ success: true, data: updatedClass });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteClass = async (req, res) => {
  const { classId } = req.params;
  try {
    const deletedClass = await Class.findByIdAndDelete(classId);
    res.json({ success: true, data: deletedClass });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getClassesByTeacher = async (req, res) => {
  const { teacherId } = req.params;
  try {
    const classes = await Class.find({ teacher: teacherId });
    res.json({ success: true, data: classes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const addStudentToClass = async (req, res) => {
  const { classId, studentId } = req.params;

  try {
    // Find the class by ID
    const foundClass = await Class.findById(classId);

    if (!foundClass) {
      return res.status(404).json({ success: false, message: "Class not found" });
    }

    // Check if student is already in the class
    if (foundClass.students.includes(studentId)) {
      return res.json({ success: false, message: "Student already enrolled" });
    }

    // Add student to class
    foundClass.students.push(studentId);
    await foundClass.save();

    res.json({ success: true, data: foundClass });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getStudentClasses = async (req, res) => {
  const { studentId } = req.params;

  try {
    // Find all classes where studentId exists in the students array
    const classes = await Class.find({ students: studentId });

    res.json({ success: true, data: classes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const isStudentEnrolled = async (req, res) => {
  const { classId, studentId } = req.params;

  try {
    // Find the class by ID
    const foundClass = await Class.findById(classId);

    if (!foundClass) {
      return res.status(404).json({ success: false, message: "Class not found" });
    }

    // Check if student is in the class
    const isEnrolled = foundClass.students.includes(studentId);

    res.json({ success: true, enrolled: isEnrolled });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const assignTeacherToClass = async (req, res) => {
  const { classId, teacherId } = req.params;
  try {
    const updatedClass = await Class.findByIdAndUpdate(
      classId,
      { $set: { teacher: teacherId } },
      { new: true }
    );
    res.json({ success: true, data: updatedClass });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const removeStudentFromClass = async (req, res) => {
    const { classId, studentId } = req.params;
    try {
      const updatedClass = await Class.findByIdAndUpdate(
        classId,
        { $pull: { students: studentId } },
        { new: true }
      );
      res.json({ success: true, data: updatedClass });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  };


  export const uploadClassRecording = async (req, res) => {
    try {
      const { classId } = req.body; // Assuming you're sending the classId along with the recording
      const recordingPath = req.file.path;
  
      // Update the class model to store the recording path
      const updatedClass = await Class.findByIdAndUpdate(
        classId,
        { $set: { recordingPath: recordingPath } },
        { new: true }
      );
  
      res.status(200).json({
        status: 'success',
        data: {
          class: updatedClass,
        },
      });
    } catch (error) {
      res.status(500).json({
        status: 'fail',
        message: error.message,
      });
    }
  };


  const updateClassMeetingInfo = async (classId, newMeetingNumber, newMeetingPassword) => {
    try {
      // Find the class by ID
      const foundClass = await Class.findById(classId);
  
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

  export const EndMeeting = async (req, res) => {
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