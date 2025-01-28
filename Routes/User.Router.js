// Import necessary modules and controllers
import express from 'express';
import {
    createUser,
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    loginUser,
    markAttendance,
    addAchievement,
    addAssessment,
    submitAssessmentForm,
    uploadImages,
    loginUserByMobile,
    getUserFind,
    updateNotificationToken
} from '../Controllers/User.Controller.js';
import multer from 'multer';

const userRouter = express.Router();


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'media/'); // Specify the path to your media folder
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + extension);
    }
});

const upload = multer({ storage: storage });
// Create a new user
userRouter.post('/',upload.array('images', 5), createUser);

userRouter.post('/login', loginUser);
userRouter.post('/loginByMobile', loginUserByMobile);
userRouter.post('/:userId/update-token', updateNotificationToken);
// Get all users
userRouter.get('/', getUsers);
userRouter.get('/find/:mobile', getUserFind);
// Get a single user by ID
userRouter.get('/:id', getUserById);

// Update a user by ID
userRouter.patch('/update/:id',upload.array('images', 1), updateUser);

// Delete a user by ID
userRouter.delete('/:id', deleteUser);

userRouter.put('/:userId/mark-attendance/:classId', markAttendance);

// Achievements routes
userRouter.put('/:userId/add-achievement', addAchievement);

// Assessments routes
userRouter.put('/:userId/add-assessment', addAssessment);

userRouter.post('/:userId/submit-assessment-form', submitAssessmentForm);


userRouter.post('/upload_images', upload.single('image'),uploadImages)

export default userRouter;
