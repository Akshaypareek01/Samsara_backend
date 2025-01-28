import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
  companyName: { type: String },
  consultPersonName: { type: String, required: true },
  email: { type: String },
  mobile: { type: String },
  designation: { type: String },
  domain: { type: String },
  numberOfEmployees: { type: Number },
  gstNumber: { type: String },
  address: { type: String },
  city: { type: String },
  pincode: { type: String },
  country: { type: String },
  status:{type:Boolean,default:true},
  createdAt: { type: Date, default: Date.now, required: true },
});

const Company = mongoose.model('Company', companySchema);

export default Company;