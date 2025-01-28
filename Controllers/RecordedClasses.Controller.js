import RecordedClass from "../Models/RecordedClass.Model.js";


// Get all classes
export const getAllRecordedClass = async (req, res) => {
  try {
    const classes = await RecordedClass.find().populate('teacher').exec();
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a specific class by ID
export const getRecordedClassById = async (req, res) => {
  try {
    const classId = req.params.id;
    const singleClass = await RecordedClass.findById(classId);
    if (!singleClass) {
      return res.status(404).json({ message: 'Class not found' });
    }
    res.json(singleClass);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new class
export const createRecordedClass = async (req, res) => {
  try {
    const newClass = await RecordedClass.create(req.body);
    res.status(201).json(newClass);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a class by ID
export const updateRecordedClass = async (req, res) => {
  try {
    const classId = req.params.id;
    const updatedClass = await RecordedClass.findByIdAndUpdate(
      classId,
      req.body,
      { new: true }
    );
    if (!updatedClass) {
      return res.status(404).json({ message: 'Class not found' });
    }
    res.json(updatedClass);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a class by ID
export const deleteRecordedClass = async (req, res) => {
  try {
    const classId = req.params.id;
    const deletedClass = await RecordedClass.findByIdAndDelete(classId);
    if (!deletedClass) {
      return res.status(404).json({ message: 'Class not found' });
    }
    res.json(deletedClass);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateClassStatus = async (req, res) => {
    try {
      const classId = req.params.id;
      const { status } = req.body;
  
      // Validate status
      if (typeof status !== 'boolean') {
        return res.status(400).json({ message: 'Invalid status value' });
      }
  
      const updatedClass = await RecordedClass.findByIdAndUpdate(
        classId,
        { status },
        { new: true }
      );
  
      if (!updatedClass) {
        return res.status(404).json({ message: 'Class not found' });
      }
  
      res.json(updatedClass);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };
