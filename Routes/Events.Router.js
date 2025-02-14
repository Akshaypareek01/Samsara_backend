

// routes/eventRoutes.js
import express from 'express';
import { EndEventMeeting, createEvent, deleteEvent, getAllEvents, getEventById, getStudentsForEvent, getUserRegisteredEvents, registerUserToEvent, updateEvent } from '../Controllers/Events.Controller.js';


const eventsRouter = express.Router();

// Create a new event
eventsRouter.post('/', createEvent);

// Get event by ID
eventsRouter.get('/:id', getEventById);

// Get all events
eventsRouter.get('/', getAllEvents);

// Update event
eventsRouter.put('/:id', updateEvent);

// Delete event
eventsRouter.delete('/:id', deleteEvent);

eventsRouter.post('/end_meeting/:classId', EndEventMeeting);

eventsRouter.post('/register', registerUserToEvent);

// Route to get all students for a specific event
eventsRouter.get('/students/:eventId', getStudentsForEvent);

// Route to get all events a user is registered in
eventsRouter.get('/user-events/:userId', getUserRegisteredEvents);

export default eventsRouter;
