import { TeacherAvailability } from '../Models/TeacherAvailability.Model.js';

// Create new availability
export const createAvailability = async (req, res) => {
    try {
        const { teacherId, session, date, startTime, endTime, availabilityFor } = req.body;

        // Check for overlapping availability
        const existingAvailability = await TeacherAvailability.findOne({
            teacherId,
            date,
            $or: [
                {
                    $and: [
                        { startTime: { $lte: startTime } },
                        { endTime: { $gt: startTime } }
                    ]
                },
                {
                    $and: [
                        { startTime: { $lt: endTime } },
                        { endTime: { $gte: endTime } }
                    ]
                }
            ],
            isActive: true
        });

        if (existingAvailability) {
            return res.status(400).json({
                status: 'fail',
                message: 'Time slot overlaps with existing availability'
            });
        }

        const newAvailability = await TeacherAvailability.create({
            teacherId,
            session,
            date,
            startTime,
            endTime,
            availabilityFor
        });

        res.status(201).json({
            status: 'success',
            data: {
                availability: newAvailability
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};

// Get all availabilities for a teacher
export const getTeacherAvailabilities = async (req, res) => {
    try {
        const { teacherId } = req.params;
        const { date, status } = req.query;

        const query = { teacherId, isActive: true };
        if (date) query.date = new Date(date);
        if (status) query.status = status;

        const availabilities = await TeacherAvailability.find(query)
            .sort({ date: 1, startTime: 1 });

        res.status(200).json({
            status: 'success',
            results: availabilities.length,
            data: {
                availabilities
            }
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: err.message
        });
    }
};

// Update availability
export const updateAvailability = async (req, res) => {
    try {
        const { id } = req.params;
        const { session, date, startTime, endTime, availabilityFor, status } = req.body;

        const availability = await TeacherAvailability.findById(id);
        if (!availability) {
            return res.status(404).json({
                status: 'fail',
                message: 'Availability not found'
            });
        }

        // Check for overlapping availability if time is being changed
        if (date || startTime || endTime) {
            const existingAvailability = await TeacherAvailability.findOne({
                teacherId: availability.teacherId,
                date: date || availability.date,
                $or: [
                    {
                        $and: [
                            { startTime: { $lte: startTime || availability.startTime } },
                            { endTime: { $gt: startTime || availability.startTime } }
                        ]
                    },
                    {
                        $and: [
                            { startTime: { $lt: endTime || availability.endTime } },
                            { endTime: { $gte: endTime || availability.endTime } }
                        ]
                    }
                ],
                isActive: true,
                _id: { $ne: id }
            });

            if (existingAvailability) {
                return res.status(400).json({
                    status: 'fail',
                    message: 'Time slot overlaps with existing availability'
                });
            }
        }

        const updatedAvailability = await TeacherAvailability.findByIdAndUpdate(
            id,
            { session, date, startTime, endTime, availabilityFor, status },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            status: 'success',
            data: {
                availability: updatedAvailability
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};

// Delete availability (soft delete)
export const deleteAvailability = async (req, res) => {
    try {
        const { id } = req.params;

        const availability = await TeacherAvailability.findByIdAndUpdate(
            id,
            { isActive: false },
            { new: true }
        );

        if (!availability) {
            return res.status(404).json({
                status: 'fail',
                message: 'Availability not found'
            });
        }

        res.status(200).json({
            status: 'success',
            data: null
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: err.message
        });
    }
};

// Get available slots for a specific date
export const getAvailableSlots = async (req, res) => {
    try {
        const { teacherId, date } = req.params;
        const { availabilityFor } = req.query;

        const query = {
            teacherId,
            date: new Date(date),
            status: 'available',
            isActive: true
        };

        if (availabilityFor) {
            query.availabilityFor = availabilityFor;
        }

        const availableSlots = await TeacherAvailability.find(query)
            .sort({ startTime: 1 });

        res.status(200).json({
            status: 'success',
            results: availableSlots.length,
            data: {
                availableSlots
            }
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: err.message
        });
    }
}; 