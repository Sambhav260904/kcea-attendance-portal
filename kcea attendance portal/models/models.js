
const mongoose = require('mongoose');

// Define a simple Student model
const studentSchema = new mongoose.Schema({
  userName: String,
  rollNumber: String,
  faceDescriptor: Array, // We'll use this later for face registration
});

const Student = mongoose.model('Student', studentSchema);


// Define an Attendance schema and model
const attendanceSchema = new mongoose.Schema({
  rollNumber: String,
  date: { type: Date, default: Date.now },
});
const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = {
    Student,
    Attendance,
  };