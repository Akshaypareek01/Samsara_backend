// models/Membership.js

import mongoose from 'mongoose';

const membershipSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  planName: {
    type: String,
    required: true
  },
  validityDays: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'expired'],
    default: 'active'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    default: function() {
      return new Date(this.startDate.getTime() + this.validityDays * 24 * 60 * 60 * 1000);
    }
  }
});

membershipSchema.methods.updateStatus = function() {
  if (new Date() > this.endDate) {
    this.status = 'expired';
  }
};

const Membership = mongoose.model('Membership', membershipSchema);

export default Membership;
