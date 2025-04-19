import { Teacher } from "../Models/Teachers.Model.js";
import { TeacherWaterIntake } from "../Models/TeacherWaterIntake.Model.js";
import jwt from 'jsonwebtoken';


export const checkTeacherByMobile = async (req, res) => {
  try {
      const { mobile } = req.body;

      if (!mobile) {
          return res.status(400).json({ success: false, message: 'Mobile number is required' });
      }

      const user = await Teacher.findOne({ mobile });

      if (user) {
          return res.status(200).json({ success: true, message: 'User exists' });
      } else {
          return res.status(200).json({ success: false, message: 'User does not exist' });
      }
  } catch (error) {
      return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const loginTeacherByMobile = async (req, res) => {
  const { mobile, password } = req.body;

  try {
      // Check if user exists with the provided mobile number
      const user = await Teacher.findOne({ mobile });

      if (!user || !(await user.correctPassword(password, user.password))) {
        return res.status(200).json({
            status: 'Not Found',
            message: 'Incorrect Mobile or password'
        });
    }

    // Generate a token and send it along with user data
    const token = jwt.sign({ id: user._id }, 'your-secret-key', {
        expiresIn: '1h' // Adjust the expiration as needed
    });

    res.status(200).json({
        status: 'success',
        token,
        data: {
            user
        }
    });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error',error });
  }
};

export const loginTeacher = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find the user by email
        const user = await Teacher.findOne({ email }).select('+password');

        // Check if the user exists and the password is correct
        if (!user || !(await user.correctPassword(password, user.password))) {
            return res.status(401).json({
                status: 'fail',
                message: 'Incorrect email or password'
            });
        }

        // Generate a token and send it along with user data
        const token = jwt.sign({ id: user._id }, 'your-secret-key', {
            expiresIn: '1h' // Adjust the expiration as needed
        });

        res.status(200).json({
            status: 'success',
            token,
            data: {
                user
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'fail',
            message: error.message
        });
    }
};

// Create a new teacher
export const createTeacher = async (req, res) => {
  try {
    const teacherData = req.body;
    const qualificationData = req.body.qualification || null;
    const additional_coursesData = req.body.additional_courses || null;
    const images = req.files || null;
    let qualificationArray;
    let additional_coursesArray;

    if(qualificationData){
      qualificationArray = JSON.parse(qualificationData);
      teacherData.qualification = qualificationArray;
    }

    if(additional_coursesData){
      additional_coursesArray = JSON.parse(additional_coursesData);
      teacherData.additional_courses = additional_coursesArray;
    }
    
    if(images){
      teacherData.images = images.map(file => ({
        filename: file.filename,
        path: file.path
      }));
    }
    
    const newTeacher = await Teacher.create(teacherData);

    // Automatically initialize water intake tracking for the new teacher
    await TeacherWaterIntake.create({
      teacherId: newTeacher._id,
      dailyGoal: 2000 // Default goal in ml
    });
    
    res.status(201).json({
      status: 'success',
      data: {
        teacher: newTeacher,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

// Get all teachers
export const getAllTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find();
    res.status(200).json({
      status: 'success',
      results: teachers.length,
      data: {
        teachers,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Internal Server Error',
    });
  }
};

// Get a single teacher by ID
export const getTeacherById = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({
        status: 'fail',
        message: 'Teacher not found',
      });
    }
    res.status(200).json({
      status: 'success',
      data: {
        teacher,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Internal Server Error',
    });
  }
};

// Update a teacher by ID
export const updateTeacher = async (req, res) => {
  try {

    const TeacherData = req.body;
    const qualificationData = req.body.qualification;
    const additional_coursesData = req.body.additional_courses;
      if (req.files && req.files.length > 0) {
        // If images are provided, update the 'images' field
        TeacherData.images = req.files.map(file => file.path);
    } else {
        // If no images provided, remove the 'images' field from userData
        delete TeacherData.images;
    }
    const qualificationArray = JSON.parse(qualificationData);
      const additional_coursesArray = JSON.parse(additional_coursesData);
      TeacherData.qualification = qualificationArray;
      TeacherData.additional_courses = additional_coursesArray;
    const updatedTeacher = await Teacher.findByIdAndUpdate(
      req.params.id,
      TeacherData,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!updatedTeacher) {
      return res.status(404).json({
        status: 'fail',
        message: 'Teacher not found',
      });
    }
    res.status(200).json({
      status: 'success',
      data: {
        teacher: updatedTeacher,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

// Delete a teacher by ID
export const deleteTeacher = async (req, res) => {
  try {
    const deletedTeacher = await Teacher.findByIdAndDelete(req.params.id);
    if (!deletedTeacher) {
      return res.status(404).json({
        status: 'fail',
        message: 'Teacher not found',
      });
    }
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Internal Server Error',
    });
  }
};

export const getTeacherStats = async (req, res) => {
  const { teacherId, days } = req.body;

  try {
      const teacher = await Teacher.findById(teacherId);
      if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const filteredAttendance = teacher.attendance.filter(att => new Date(att.joinedAt) >= startDate);

      const totalClasses = filteredAttendance.length;
      const totalMinutes = filteredAttendance.reduce((sum, att) => sum + (att.durationMinutes || 0), 0);
      const totalKcalBurned = filteredAttendance.reduce((sum, att) => sum + (att.kcalBurned || 0), 0);

      res.status(200).json({ totalClasses, totalMinutes, totalKcalBurned });
  } catch (error) {
      res.status(500).json({ message: 'Server error', error });
  }
};

export const getTeacherWeeklyStats = async (req, res) => {
  const { teacherId } = req.body;

  try {
      const teacher = await Teacher.findById(teacherId);
      if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

      const today = new Date();
      const startDate = new Date();
      startDate.setDate(today.getDate() - 6); // Get last 7 days

      const weeklyData = {};
      const daysMap = ['S', 'M', 'T', 'W', 'Th', 'F', 'Sa']; // Updated correct mapping

      for (let i = 0; i < 7; i++) {
          const date = new Date(startDate);
          date.setDate(startDate.getDate() + i);
          const label = daysMap[date.getDay()];
          
          // Default values set to 5 instead of 0
          weeklyData[label] = { label, totalMinutes: 5, totalKcalBurned: 5 };
      }

      teacher.attendance.forEach(att => {
          const attDate = new Date(att.joinedAt);
          if (attDate >= startDate && attDate <= today) {
              const label = daysMap[attDate.getDay()];
              if (weeklyData[label]) {
                  weeklyData[label].totalMinutes = (att.durationMinutes || 0) + (weeklyData[label].totalMinutes !== 5 ? weeklyData[label].totalMinutes : 0);
                  weeklyData[label].totalKcalBurned = (att.kcalBurned || 0) + (weeklyData[label].totalKcalBurned !== 5 ? weeklyData[label].totalKcalBurned : 0);
              }
          }
      });

      const result = Object.values(weeklyData);
      res.status(200).json(result);
  } catch (error) {
      res.status(500).json({ message: 'Server error', error });
  }
};
