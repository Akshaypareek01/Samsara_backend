import { User } from '../Models/User.Model.js';
import { Teacher } from '../Models/Teachers.Model.js';

export const checkMobileNumber = async (req, res) => {
    try {
        const { mobile } = req.body;

        if (!mobile) {
            return res.status(400).json({
                status: false,
                message: 'Mobile number is required'
            });
        }

        // Check in User model
        const userExists = await User.findOne({ mobile });
        // Check in Teacher model
        const teacherExists = await Teacher.findOne({ mobile });

        const isAvailable = !(userExists || teacherExists);
        const existsIn = userExists ? 'user' : teacherExists ? 'teacher' : null;

        res.status(200).json({
            status: true,
            data: {
                isAvailable,
                existsIn
            }
        });

    } catch (error) {
        console.error('Error checking mobile number:', error);
        res.status(500).json({
            status: false,
            message: 'Internal server error'
        });
    }
}; 