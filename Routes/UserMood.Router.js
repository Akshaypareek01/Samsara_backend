import express from 'express';
import { addMood, deleteMoodEntry, getLatestMood, getMoodHistory } from '../Controllers/UserMood.Controller.js';




const UserMoodRouter = express.Router();
// UserMoodRouter.post(createMood);
// UserMoodRouter.get('/:userId',getMoodByUserId)
// UserMoodRouter.put('/:userId',updateMoodByUserId)
// UserMoodRouter.delete('/:userId',deleteMoodByUserId);

UserMoodRouter.post('/add', addMood); // Add a new mood entry
UserMoodRouter.get('/history', getMoodHistory); // Get mood history
UserMoodRouter.get('/latest', getLatestMood); // Get the latest mood entry
UserMoodRouter.delete('/delete/:moodId', deleteMoodEntry); // Delete a mood entry

export default UserMoodRouter;