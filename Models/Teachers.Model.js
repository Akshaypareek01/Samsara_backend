import mongoose from 'mongoose';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import validator from 'validator';

const teacherSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A user must have a name'],
        maxlength: [20, 'Username must be less than or equal to 10 characters.']
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    gender: {
        type: String,
    },
    password: {
        type: String,
        // required: [true, 'Please provide a password'],
        // minlength: 8
    },
    mobile: {
        type: String,
        required: [true, 'Please provide a mobile number'],
        minlength: 10
    },
    bodyshape:{
        type: String,
        required: [false, 'Please provide  user body shape'],
    },
    height: {
        type: String,
        required: [false, 'user height is required'],
        
    },
    weight: {
        type: String,
        required: [false, 'user weight is required'],
        
    },

    teachingExperience: {
        type: String,
    },
    dob: {
        type: String,
        required: [true, 'Please provide  data of birth'],
        
    },
    age: {
        type: String,
        required: [false, 'Please provide  user age'],
        
    },
    images: [{
        filename: String, // Store the filename of the image
        path: String,     // Store the path to the image in the media folder
    }],
    Address:{
        type: String,
        required: [true, 'Please provide  address'],
    },
    expertise:[String],
    city: {
        type: String,
        required: [true, 'A user must have a city'],
        
    },
    pincode: {
        type: String,
        required: [true, 'A user must have a pincode'],
        
    },
    country: {
        type: String,
        required: [true, 'A user must have a country'],
        
    },
    qualification:[Object],
    additional_courses:[Object],
    description: {
        type: String,
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    attendance: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Class' }],
    achievements: [String],
    status: {
        type: Boolean,
        default: true,
      },
    active: {
        type: Boolean,
        default: false,
    }
},
    {
        timestamps: {
        }
    });

teacherSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    // Hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);

    // Delete passwordConfirm field
    this.passwordConfirm = undefined;
    next();
});

teacherSchema.pre('save', function (next) {
    if (!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000;
    next();
});
/**
 * Reset Password
 */
teacherSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    return resetToken;
}

teacherSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

teacherSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime());
        return JWTTimestamp < changedTimestamp;
    }
    // False means Not Changed
    return false;
}



export const Teacher = mongoose.model('Teachers', teacherSchema);