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

export const getAllUpcomingClasses = async (req, res) => {
  try {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Reset time to 00:00:00 for the current day

    const classes = await Class.find({ schedule: { $gte: currentDate } }) // Includes today & future dates
      .populate('teacher')
      .exec();

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

export const getStudentUpcomingClasses = async (req, res) => {
  const { studentId } = req.params;

  try {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Reset time to midnight (00:00:00) to include today's classes

    // Find all upcoming classes where the student is enrolled
    const classes = await Class.find({ 
      students: studentId, 
      schedule: { $gte: currentDate } // Only fetch today’s and future classes
    })

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

const predefinedClasses=[
  {
    "title": "Core Strength Yoga",
    "description": "A session designed to build core stability and strength through controlled movements and mindful engagement. It includes deep abdominal work and balancing postures.",
    "startTime": "07:30",
    "endTime": "08:45",
    "schedule": "2025-04-31",
    "howItWillHelp": "Enhances core strength, improves posture, and reduces back pain. Helps in developing better body control and stability.",
    "howItWillnotHelp": "Not focused on full-body muscle building or high-intensity weight training. It may not provide rapid weight loss results.",
    "level": "Intermediate",
    "password": "12345678",
    "teacher": "65fd1a567c0c2a5ca6be2305",
    "whoitsfor": "Perfect for those wanting to improve core strength and stability. Ideal for individuals with weak abdominal muscles or lower back issues.",
    "whoitsnotfor": "Not suitable for those looking for a relaxing or meditative yoga session. May not be the best fit for those with severe spinal injuries."
  },
  {
    "title": "Evening Unwind Yoga",
    "description": "A gentle evening session focused on releasing tension and calming the nervous system. It incorporates slow stretches and deep relaxation techniques.",
    "startTime": "18:30",
    "endTime": "19:45",
    "schedule": "2025-04-25",
    "howItWillHelp": "Helps in unwinding after a long day, improves sleep quality, and promotes relaxation. Reduces stress and soothes the nervous system.",
    "howItWillnotHelp": "Not meant for building strength or increasing endurance. It does not offer high-intensity movements or dynamic sequences.",
    "level": "Intermediate",
    "password": "12345678",
    "teacher": "65fd1a567c0c2a5ca6be2305",
    "whoitsfor": "Great for individuals who want to relax and destress in the evening. Ideal for those struggling with sleep issues or anxiety.",
    "whoitsnotfor": "Not for people looking for a high-energy workout or cardio session. May not be suitable for those wanting fast-paced yoga flows."
  },
  {
    "title": "Detox & Cleanse Yoga",
    "description": "A revitalizing practice focusing on detoxifying the body through deep twists, breathwork, and fluid movements. Helps in boosting digestion and energy levels.",
    "startTime": "07:00",
    "endTime": "08:15",
    "schedule": "2025-04-18",
    "howItWillHelp": "Aids digestion, improves circulation, and supports the body’s natural detoxification process. Enhances overall vitality and well-being.",
    "howItWillnotHelp": "Not a substitute for medical detox programs or dietary changes. It won’t provide extreme weight loss in a short time.",
    "level": "Intermediate",
    "password": "12345678",
    "teacher": "65fd1a567c0c2a5ca6be2305",
    "whoitsfor": "Perfect for those wanting to improve digestion and feel rejuvenated. Great for individuals looking to reset their body and mind.",
    "whoitsnotfor": "Not ideal for those looking for an intense strength-building workout. May not be suitable for people with severe digestive disorders."
  },
  {
    "title": "Balance & Stability Yoga",
    "description": "A practice focusing on improving balance, coordination, and stability through controlled poses. Strengthens key muscle groups while enhancing body awareness.",
    "startTime": "08:00",
    "endTime": "09:20",
    "schedule": "2025-04-20",
    "howItWillHelp": "Develops balance, strengthens core muscles, and enhances coordination. Helps in preventing falls and injuries by improving body control.",
    "howItWillnotHelp": "Not designed for intense muscle building or weight training. It does not provide a high-calorie burn workout.",
    "level": "Intermediate",
    "password": "12345678",
    "teacher": "65fd1a567c0c2a5ca6be2305",
    "whoitsfor": "Great for those looking to improve balance and prevent injuries. Ideal for athletes and individuals working on body coordination.",
    "whoitsnotfor": "Not for those seeking a relaxing or meditative session. May not be suitable for individuals with severe balance disorders."
  },
  {
    "title": "Heart-Opening Yoga Flow",
    "description": "A gentle yet energizing practice designed to open the chest and shoulders. It includes backbends and stretches that release emotional tension and enhance posture.",
    "startTime": "07:15",
    "endTime": "08:30",
    "schedule": "2025-04-29",
    "howItWillHelp": "Improves spinal flexibility, enhances posture, and releases stored tension. Supports emotional well-being and boosts confidence.",
    "howItWillnotHelp": "Not a high-intensity strength or endurance workout. It may not help in immediate weight loss or muscle building.",
    "level": "Intermediate",
    "password": "12345678",
    "teacher": "65fd1a567c0c2a5ca6be2305",
    "whoitsfor": "Ideal for those who want to improve posture and reduce stiffness. Great for individuals looking to open up emotionally and physically.",
    "whoitsnotfor": "Not suitable for those with severe back injuries or limited spinal flexibility. May not be ideal for those wanting fast movements."
  },
  {
    "title": "Yoga for Stress & Anxiety",
    "description": "A slow-paced session designed to calm the mind and body through deep breathing and grounding poses. Helps in reducing stress and promoting emotional balance.",
    "startTime": "18:00",
    "endTime": "19:30",
    "schedule": "2025-04-23",
    "howItWillHelp": "Relieves stress, reduces anxiety, and promotes relaxation. Helps in cultivating mindfulness and emotional resilience.",
    "howItWillnotHelp": "Not a replacement for professional therapy or medical treatments. It does not provide a cardiovascular workout or intense calorie burn.",
    "level": "Intermediate",
    "password": "12345678",
    "teacher": "65fd1a567c0c2a5ca6be2305",
    "whoitsfor": "Great for anyone dealing with stress, anxiety, or emotional imbalance. Suitable for those seeking relaxation and mindfulness.",
    "whoitsnotfor": "Not for those looking for an intense workout or fast-paced session. May not be ideal for people who prefer high-energy yoga."
  },
  {
    "title": "Sun Salutation Flow",
    "description": "A dynamic session focusing on repeated sun salutations to build heat and flexibility. It includes seamless transitions to energize and strengthen the body.",
    "startTime": "07:00",
    "endTime": "08:15",
    "schedule": "2025-04-27",
    "howItWillHelp": "Improves endurance, builds strength, and enhances flexibility. Boosts circulation and helps in kickstarting the metabolism.",
    "howItWillnotHelp": "Not a slow, restorative practice for deep relaxation. It may not be suitable for individuals with limited mobility or injuries.",
    "level": "Intermediate",
    "password": "12345678",
    "teacher": "65fd1a567c0c2a5ca6be2305",
    "whoitsfor": "Perfect for those looking to boost energy and flexibility. Great for individuals who enjoy dynamic and flowing movements.",
    "whoitsnotfor": "Not ideal for people looking for stillness or deep relaxation. May not suit beginners unfamiliar with sun salutations."
  },
  {
    "title": "Yin Yoga for Deep Stretching",
    "description": "A slow and meditative session focusing on deep holds and passive stretching. It targets connective tissues, promoting flexibility and relaxation.",
    "startTime": "19:00",
    "endTime": "20:15",
    "schedule": "2025-05-12",
    "howItWillHelp": "Enhances deep tissue flexibility, reduces tension, and improves circulation. Helps in relaxation and emotional grounding.",
    "howItWillnotHelp": "Not focused on strength building or fast movements. It may not provide a cardio workout or quick fitness gains.",
    "level": "Intermediate",
    "password": "12345678",
    "teacher": "65fd1a567c0c2a5ca6be2305",
    "whoitsfor": "Best for individuals looking for deep relaxation and flexibility. Ideal for those needing a slow, meditative practice.",
    "whoitsnotfor": "Not suitable for those seeking a fast-paced or intense workout. May not be ideal for those with limited patience for long holds."
  }
]




  export const addPredefinedClasses = async (req, res) => {
    try {
      const insertedClasses = await Class.insertMany(predefinedClasses);
      res.status(201).json({ message: "Predefined classes added successfully", data: insertedClasses });
    } catch (error) {
      res.status(500).json({ message: "Error adding predefined classes", error: error.message });
    }
  };