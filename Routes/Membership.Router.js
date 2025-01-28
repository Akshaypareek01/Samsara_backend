// routes/membershipRoutes.js

import express from 'express';
import { changeStatus, createMembership, deleteMembership, getAllMemberships, getMembershipByUserId, updateMembership, updateValidity } from '../Controllers/MemberShip.Controller.js';


const MembershipRouter = express.Router();

// Create a new membership
MembershipRouter.post('/', createMembership);

// Update membership details
MembershipRouter.put('/:id', updateMembership);

// Update membership validity
MembershipRouter.put('/:id/validity', updateValidity);

// Change membership status
MembershipRouter.put('/:id/status', changeStatus);

// Delete a membership
MembershipRouter.delete('/:id', deleteMembership);

// Get membership by userId
MembershipRouter.get('/user/:userId', getMembershipByUserId);

// Get all membership data
MembershipRouter.get('/', getAllMemberships);

export default MembershipRouter;
