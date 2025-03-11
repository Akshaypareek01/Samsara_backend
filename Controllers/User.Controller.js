import { User } from "../Models/User.Model.js";
import jwt from 'jsonwebtoken';
import { Mood } from "../Models/UserMood.Model.js";
import Membership from "../Models/Membership.Model.js";
import EventApplication from "../Models/EventApplication.Model.js";
import { CustomSession } from "../Models/CustomSession.Model.js";
import { Class } from "../Models/Class.Model.js";

export const checkUserByMobile = async (req, res) => {
  try {
      const { mobile } = req.body;

      if (!mobile) {
          return res.status(400).json({ success: false, message: 'Mobile number is required' });
      }

      const user = await User.findOne({ mobile });

      if (user) {
          return res.status(200).json({ success: true, message: 'User exists' });
      } else {
          return res.status(200).json({ success: false, message: 'User does not exist' });
      }
  } catch (error) {
      return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Check if email is already used
export const checkUserByEmail = async (req, res) => {
  try {
      const { email } = req.body;

      if (!email) {
          return res.status(400).json({ success: false, message: 'Email is required' });
      }

      const user = await User.findOne({ email });

      if (user) {
          return res.status(200).json({ success: true, message: 'Email is already in use' });
      } else {
          return res.status(200).json({ success: false, message: 'Email is available' });
      }
  } catch (error) {
      return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find the user by email
        const user = await User.findOne({ email }).select('+password');
         console.log("User found", user);
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

export const loginUserByMobile = async (req, res) => {
  const { mobile, password } = req.body;

  try {
      // Check if user exists with the provided mobile number
      const user = await User.findOne({ mobile }).populate('company_name').exec();

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


// Create a new user
export const createUser = async (req, res) => {
    try {
      console.log("Data ==>",req.body)
      // console.log("images",req.file)
      const userData = req.body;
              
      const images = req.files || [];
      //  console.log("Images",images)
       
        userData.images = images.map(file => ({
            filename: file.filename,
            path: file.path
        }));
      

        const newUser = await User.create(userData);
        const defaultMood = {
          userId: newUser._id,
          mood: 'Happy' // You can set a default mood value
        };
        await Mood.create(defaultMood);

        const membershipData = {
          userId: newUser._id,
          planName: 'Trail Plan', // You can set a default plan name
          validityDays: 7,
          status: 'active',
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 1 day from now
      };
      await Membership.create(membershipData);


        res.status(201).json({
            status: 'success',
            data: {
                user: newUser
            }
        });
    } catch (error) {
      console.log("Error",error)
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

// Get all users
export const getUsers = async (req, res) => {
    try {
        const users = await User.find().populate('company_name').exec();
        res.status(200).json({
            status: 'success',
            data: {
                users
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'fail',
            message: error.message
        });
    }
};
export const getUserFind = async (req, res) => {
  try {
    
    const mobile = req.params.mobile;

    const user = await User.findOne({ mobile });

    if (user) {
        res.status(200).json({
            success: true,
            data: user,
            message: 'User found',
        });
    } else {
        res.status(200).json({
            success: false,
            message: 'User not found',
        });
    }
  } catch (error) {
      res.status(500).json({
          status: 'fail',
          message: error.message
      });
  }
};

// Get a single user by ID
export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate('company_name').exec();
        res.status(200).json({
            status: 'success',
            data: {
                user
            }
        });
    } catch (error) {
        res.status(404).json({
            status: 'fail',
            message: 'User not found'
        });
    }
};

// Update a user by ID
export const updateUser = async (req, res) => {
    try {
      // console.log('Updating user', req.body)
      const userData = req.body;
      if (req.files && req.files.length > 0) {
        // If images are provided, update the 'images' field
        userData.images = req.files.map(file => file.path);
    } else {
        // If no images provided, remove the 'images' field from userData
        delete userData.images;
    }
        const updatedUser = await User.findByIdAndUpdate(req.params.id, userData, {
            new: true,
            runValidators: true
        });
        // console.log(updatedUser)
        res.status(200).json({
            status: 'success',
            data: {
                user: updatedUser
            }
        });
    } catch (error) {
      // console.log("Error while update user ==>",error)
        res.status(400).json({
            status: 'fail',
            message: error
        });
    }
};

// Delete a user by ID
export const deleteUser = async (req, res) => {
    try {
      const user = await User.find({ _id: req.params.id });
      console.log("User delete data ===>",user)
      if (!user) {
          return res.status(404).json({
              status: 'fail',
              message: 'User not found'
          });
      }
      await Membership.deleteMany({ userId: req.params.id  });
      await EventApplication.deleteMany({ userId: req.params.id  });
      await CustomSession.deleteMany({ user: req.params.id  });
      await Mood.deleteMany({ userId:req.params.id  });
      await User.findByIdAndDelete(req.params.id);

      res.status(204).json({
            status: 'success',
            data: null
      });
      
    } catch (error) {
        res.status(404).json({
            status: 'fail',
            message:error
        });
    }
};

export const markAttendance = async (req, res) => {
    const { userId, classId } = req.params;
  
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { $push: { attendance: classId } },
        { new: true }
      );
  
      res.status(200).json({
        status: 'success',
        data: {
          user,
        },
      });
    } catch (error) {
      res.status(500).json({
        status: 'fail',
        message: error.message,
      });
    }
  };

export const addAchievement = async (req, res) => {
    const { userId } = req.params;
    const { achievement } = req.body;
  
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { $push: { achievements: achievement } },
        { new: true }
      );
  
      res.status(200).json({
        status: 'success',
        data: {
          user,
        },
      });
    } catch (error) {
      res.status(500).json({
        status: 'fail',
        message: error.message,
      });
    }
  };

  export const addAssessment = async (req, res) => {
    const { userId } = req.params;
    const { assessmentId } = req.body;
  
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { $push: { assessments: assessmentId } },
        { new: true }
      );
  
      res.status(200).json({
        status: 'success',
        data: {
          user,
        },
      });
    } catch (error) {
      res.status(500).json({
        status: 'fail',
        message: error.message,
      });
    }
  };

  export const submitAssessmentForm = async (req, res) => {
    const { userId, classId, formData } = req.body;
  
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        {
          $push: {
            classFeedback: {
              classId,
              formData,
            },
          },
        },
        { new: true }
      );
  
      res.status(200).json({
        status: 'success',
        data: {
          user,
        },
      });
    } catch (error) {
      res.status(500).json({
        status: 'fail',
        message: error.message,
      });
    }
  };

  export const uploadImages =  async (req, res) => {
    try {
        // Assuming you have the user ID available in req.user._id
        const userId = req.user._id;

        // Update the user document with the uploaded image details
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                $push: {
                    images: {
                        filename: req.file.filename,
                        path: req.file.path
                    }
                }
            },
            { new: true } // Return the updated user document
        );

        res.json(updatedUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


export const updateNotificationToken = async (req, res) => {
  const { userId } = req.params;
    const { notificationToken } = req.body;
  try {
      const user = await User.findById(userId);
      if (!user) {
          throw new Error('User not found');
      }
      user.notificationToken = notificationToken;
      await user.save();
      return res.status(200).json({
        status: true,
        message: 'Notification token updated successfully',
      });
       
  } catch (error) {
      console.error('Error updating notification token:', error);
     
       return res.status(400).json({
        status: false,
        message: 'Failed to update notification token',
      });
  }
};



export const joinClass = async (req, res) => {
  const { userId, classId } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const yogaClass = await Class.findById(classId);
    if (!yogaClass) return res.status(404).json({ message: 'Class not found' });

    // Check if user already joined the class
    const existingAttendance = user.attendance.find(att => att.classId.toString() === classId);

    if (existingAttendance) {
      return res.status(200).json({ message: 'Attendance already taken for this class', joinedAt: existingAttendance.joinedAt });
    }

    // Add new attendance entry
    const joinedAt = new Date();
    user.attendance.push({ classId, joinedAt });

    await user.save();
    res.status(200).json({ message: 'User joined the class', joinedAt });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const leaveClass = async (req, res) => {
  const { userId, classId } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const attendedClass = user.attendance.find(att => att.classId.toString() === classId);
    if (!attendedClass) return res.status(404).json({ message: 'User did not join this class' });

    const leftAt = new Date();
    
    // If user rejoins and leaves multiple times, update leave time instead of adding new entries
    const durationMinutes = Math.round((leftAt - attendedClass.joinedAt) / 60000); // Convert ms to minutes
    const kcalBurned = durationMinutes * 5; // Assuming avg 5 kcal per min

    attendedClass.leftAt = leftAt;
    attendedClass.durationMinutes = durationMinutes;
    attendedClass.kcalBurned = kcalBurned;

    await user.save();
    res.status(200).json({ message: 'User left the class', durationMinutes, kcalBurned });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};


export const getUserStats = async (req, res) => {
  const { userId, days } = req.body;

  try {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: 'User not found' });

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const filteredAttendance = user.attendance.filter(att => new Date(att.joinedAt) >= startDate);

      const totalClasses = filteredAttendance.length;
      const totalMinutes = filteredAttendance.reduce((sum, att) => sum + (att.durationMinutes || 0), 0);
      const totalKcalBurned = filteredAttendance.reduce((sum, att) => sum + (att.kcalBurned || 0), 0);

      res.status(200).json({ totalClasses, totalMinutes, totalKcalBurned });
  } catch (error) {
      res.status(500).json({ message: 'Server error', error });
  }
};

export const getWeeklyStats = async (req, res) => {
  const { userId } = req.body;
  
  try {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: 'User not found' });

      const today = new Date();
      const startDate = new Date();
      startDate.setDate(today.getDate() - 6); // Get last 7 days

      const weeklyData = {};
      const daysMap = ['S', 'M', 'T', 'W', 'Th', 'F', 'Sa']; // Updated correct mapping

      for (let i = 0; i < 7; i++) {
          const date = new Date(startDate);
          date.setDate(startDate.getDate() + i);
          const label = daysMap[date.getDay()];
          weeklyData[label] = { label, totalMinutes: 0, totalKcalBurned: 0 };
      }

      user.attendance.forEach(att => {
          const attDate = new Date(att.joinedAt);
          if (attDate >= startDate && attDate <= today) {
              const label = daysMap[attDate.getDay()];
              if (weeklyData[label]) {
                  weeklyData[label].totalMinutes += att.durationMinutes || 1;
                  weeklyData[label].totalKcalBurned += att.kcalBurned || 1;
              }
          }
      });

      const result = Object.values(weeklyData);
      res.status(200).json(result);
  } catch (error) {
      res.status(500).json({ message: 'Server error', error });
  }
};
