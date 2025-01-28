import Membership from "../Models/Membership.Model.js";
import cron from 'node-cron';

// Create a new membership
export const createMembership = async (req, res) => {
  try {
    const { userId, planName, validityDays } = req.body;
    const newMembership = new Membership({ userId, planName, validityDays });
    await newMembership.save();
    res.status(201).json(newMembership);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update membership details
export const updateMembership = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updatedMembership = await Membership.findByIdAndUpdate(id, updates, { new: true });
    res.status(200).json(updatedMembership);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update membership validity
export const updateValidity = async (req, res) => {
  try {
    const { id } = req.params;
    const { validityDays } = req.body;
    const membership = await Membership.findById(id);
    membership.validityDays = validityDays;
    membership.endDate = new Date(membership.startDate.getTime() + validityDays * 24 * 60 * 60 * 1000);
    await membership.save();
    res.status(200).json(membership);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Change membership status
export const changeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const membership = await Membership.findById(id);
    membership.status = status;
    await membership.save();
    res.status(200).json(membership);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Automatically change status after validity ends
export const checkValidityAndUpdateStatus = async () => {
  try {
    const memberships = await Membership.find();
    memberships.forEach(async (membership) => {
      membership.updateStatus();
      await membership.save();
    });
  } catch (error) {
    console.error('Error updating membership statuses:', error.message);
  }
};

// Delete a membership
export const deleteMembership = async (req, res) => {
  try {
    const { id } = req.params;
    await Membership.findByIdAndDelete(id);
    res.status(200).json({ message: 'Membership deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get membership by userId
export const getMembershipByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const memberships = await Membership.find({ userId });
    res.status(200).json(memberships);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all membership data
export const getAllMemberships = async (req, res) => {
  try {
    const memberships = await Membership.find();
    res.status(200).json(memberships);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const checkAndUpdateMemberships = async () => {
    try {
      const memberships = await Membership.find();
      memberships.forEach(async (membership) => {
        membership.updateStatus();
        await membership.save();
      });
    } catch (error) {
      console.error('Error updating membership statuses:', error.message);
    }
  };
  
  // Schedule the task to run every day at midnight
  cron.schedule('0 0 * * *', () => {
    console.log('Running a job to check membership statuses');
    checkAndUpdateMemberships();
  });