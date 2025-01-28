// models/Event.js
import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
    eventName: {
        type: String,
       
    },
    image: {
        type: String,
     
    },
    startDate: {
        type: Date,
        
    },
    startTime: {
        type: String,
        
    },
    eventType:{
        type: String,
    },
    details: {
        type: String,
       
    },
    password: { type: String,default:""},
    meeting_number:{ type: String,default:""},
    status: {
        type: Boolean,
        default: false,
      },
}, { timestamps: true });

const Event = mongoose.model('Event', eventSchema);

export default Event;
    