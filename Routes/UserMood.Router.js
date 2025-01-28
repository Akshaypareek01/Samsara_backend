import express from 'express';
import { createMood, deleteMoodByUserId, getMoodByUserId, updateMoodByUserId } from '../Controllers/UserMood.Controller.js';




const UserMoodRouter = express.Router();
UserMoodRouter.post(createMood);
UserMoodRouter.get('/:userId',getMoodByUserId)
UserMoodRouter.put('/:userId',updateMoodByUserId)
UserMoodRouter.delete('/:userId',deleteMoodByUserId);


export default UserMoodRouter;