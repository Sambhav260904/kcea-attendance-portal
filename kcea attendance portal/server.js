// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { Student, Attendance } = require('./models/models');
require('dotenv').config();

const app = express();
// Use Express's built-in JSON middleware
app.use(express.json());
app.use(cors());

// const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;


// Connect to MongoDB (adjust connection string as needed)
mongoose.connect(MONGO_URI)
.then(() => console.log("Connected to MongoDB"))
.catch(err => console.error("MongoDB connection error:", err));


// Endpoint to check if a user exists by roll number
app.post('/api/checkUser', async (req, res) => {
  const { rollNumber } = req.body;
  if (!rollNumber) {
    return res.status(400).json({ error: "Roll number is required" });
  }
  try {
    const student = await Student.findOne({ rollNumber });
    if (student) {
      // User exists, so they can proceed to the attendance home page
      res.json({ exists: true, message: "User exists" });
    } else {
      // User does not exist, so they need to register their face
      res.json({ exists: false, message: "User does not exist" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
 



// Endpoint to register a user's face
app.post('/api/registerFace', async (req, res) => {
    const { rollNumber, faceDescriptor } = req.body;
    if (!rollNumber || !faceDescriptor) {
      return res.status(400).json({ success: false, message: "Roll number and face descriptor are required." });
    }
    try {
      // Check if the user already exists
      let student = await Student.findOne({ rollNumber });
      if (student) {
        return res.status(400).json({ success: false, message: "User already registered." });
      }
      // Create and save the new student
      student = new Student({ rollNumber, faceDescriptor });
      await student.save();
      res.json({ success: true, message: "Face registered successfully." });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Server error." });
    }
  });
  



  // Endpoint to get attendance status for a given roll number (for current day)
  app.get('/api/attendanceStatus', async (req, res) => {
    const { rollNumber } = req.query;
    if (!rollNumber) {
      return res.status(400).json({ error: "Roll number is required" });
    }
    
    // Calculate the start and end of the current day
    const startOfDay = new Date();
    startOfDay.setHours(0,0,0,0);
    const endOfDay = new Date();
    endOfDay.setHours(23,59,59,999);
    
    try {
      const record = await Attendance.findOne({ 
        rollNumber, 
        date: { $gte: startOfDay, $lte: endOfDay } 
      });
      if (record) {
        res.json({ present: true });
      } else {
        res.json({ present: false });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  });



// Endpoint to mark attendance (for current day)
app.post('/api/markAttendance', async (req, res) => {
  const { rollNumber } = req.body;
  if (!rollNumber) {
    return res.status(400).json({ success: false, message: "Roll number is required." });
  }
  
  // Calculate start and end of current day
  const startOfDay = new Date();
  startOfDay.setHours(0,0,0,0);
  const endOfDay = new Date();
  endOfDay.setHours(23,59,59,999);
  
  try {
    // Check if attendance is already marked for today
    const record = await Attendance.findOne({ 
      rollNumber, 
      date: { $gte: startOfDay, $lte: endOfDay } 
    });
    if (record) {
      return res.status(400).json({ success: false, message: "Attendance already marked for today." });
    }
    
    const newAttendance = new Attendance({ rollNumber });
    await newAttendance.save();
    res.json({ success: true, message: "Attendance marked successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error." });
  }
});


// Endpoint to get a student's data by roll number (including faceDescriptor)
app.get('/api/getStudent', async (req, res) => {
  const { rollNumber } = req.query;
  if (!rollNumber) {
    return res.status(400).json({ error: "Roll number is required" });
  }
  try {
    const student = await Student.findOne({ rollNumber });
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }
    res.json(student);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


// Endpoint to download CSV file of present students for the current day
// Endpoint to download CSV file of present students for a given date
app.get('/api/downloadAttendanceCSV', async (req, res) => {
  // Get date from query parameter; if not provided, use today's date
  const { date } = req.query;
  let queryDate = date ? new Date(date) : new Date();

  // Calculate start and end of the query day
  const startOfDay = new Date(queryDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(queryDate);
  endOfDay.setHours(23, 59, 59, 999);

  try {
    // Fetch attendance records for the given day
    const records = await Attendance.find({ 
      date: { $gte: startOfDay, $lte: endOfDay } 
    });

    // Build CSV header and rows
    let csv = 'Roll Number,Date\n';
    records.forEach(record => {
      csv += `${record.rollNumber},${record.date.toISOString()}\n`;
    });

    // Format file name as "present_students_YYYY-MM-DD.csv"
    const fileDate = queryDate.toISOString().split('T')[0]; // Extract YYYY-MM-DD
    const fileName = `present_students_${fileDate}.csv`;
    
    res.header('Content-Type', 'text/csv');
    res.attachment(fileName);
    return res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});


// Endpoint to download complete attendance record for a given roll number
app.get('/api/downloadCompleteAttendanceCSV', async (req, res) => {
  const { rollNumber } = req.query;
  if (!rollNumber) {
    return res.status(400).json({ error: "Roll number is required" });
  }
  
  try {
    // Query all attendance records for the given roll number
    const records = await Attendance.find({ rollNumber });
    
    // Build CSV string with header "Date"
    let csv = "Date\n";
    records.forEach(record => {
      csv += `${record.date.toISOString()}\n`;
    });
    
    // Construct file name using roll number
    const fileName = `${rollNumber}_complete_attendance.csv`;
    
    // Set headers for CSV download and send the CSV data
    res.header("Content-Type", "text/csv");
    res.attachment(fileName);
    return res.send(csv);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});


// Start the server
app.use(express.static("public"));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
