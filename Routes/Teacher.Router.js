import express from 'express';
import {
  createTeacher,
  getAllTeachers,
  getTeacherById,
  updateTeacher,
  deleteTeacher,
  loginTeacher,
  checkTeacherByMobile,
  loginTeacherByMobile
} from '../Controllers/Teacher.Controller.js';
import multer from 'multer';
import { uploadClassRecording } from '../Controllers/Classes.Controller.js';

const teacherRouter = express.Router();
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Adjust the destination folder as needed
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });
// Create a new teacher
teacherRouter.post('/', createTeacher);

teacherRouter.post('/check-mobile', checkTeacherByMobile);
teacherRouter.post('/loginByMobile', loginTeacherByMobile);
// Get all teachers
teacherRouter.get('/', getAllTeachers);

// Get a single teacher by ID
teacherRouter.get('/:id', getTeacherById);

// Update a teacher by ID
teacherRouter.patch('/:id',upload.array('images', 2), updateTeacher);

// Delete a teacher by ID
teacherRouter.delete('/:id', deleteTeacher);

// Login
teacherRouter.post('/login', loginTeacher);



teacherRouter.post('/upload-recording', upload.single('recording'), uploadClassRecording);


export default teacherRouter;
