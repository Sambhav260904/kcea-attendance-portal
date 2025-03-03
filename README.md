# KCEA Attendance System

A full-stack web application for managing student attendance using face recognition technology. The system leverages modern web technologies to provide a seamless experience for registering faces, marking attendance, and viewing attendance analytics.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation & Setup](#installation--setup)
- [Usage](#usage)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Overview

KCEA Attendance System is designed to simplify and automate the process of attendance management. Using advanced face recognition with [face-api.js](https://github.com/justadudewhohacks/face-api.js) and a responsive interface built with HTML, CSS (Tailwind CSS), and JavaScript, the system ensures accurate, real-time attendance tracking for students based on their registered face data.

## Features

- **Face Registration:**  
  Users can register their face by capturing a facial descriptor using the webcam.
  
- **Real-Time Face Recognition:**  
  The application continuously detects and recognizes faces, enabling a quick and secure attendance marking process.
  
- **Attendance Marking:**  
  Automatically marks attendance for the day if the registered face is recognized.
  
- **Attendance Dashboard:**  
  Displays attendance status, analytics, and statistics in a user-friendly interface.
  
- **CSV Export:**  
  - Download attendance data for a specific date.
  - Download complete attendance records for a given roll number.
  
- **Responsive Design:**  
  Fully responsive user interface, optimized for both desktop and mobile devices.
  
- **Secure & Scalable:**  
  Built with Node.js, Express, and MongoDB (with Mongoose), ensuring a robust backend and easy scalability.

## Tech Stack

- **Frontend:**
  - HTML, CSS, JavaScript
  - [Tailwind CSS](https://tailwindcss.com/)
  - [face-api.js](https://github.com/justadudewhohacks/face-api.js) for face detection and recognition

- **Backend:**
  - Node.js with [Express](https://expressjs.com/)
  - [MongoDB](https://www.mongodb.com/) using [Mongoose](https://mongoosejs.com/) for data modeling
  - [CORS](https://www.npmjs.com/package/cors) for cross-origin resource sharing
  - [dotenv](https://www.npmjs.com/package/dotenv) for environment variable management

## Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) installed on your machine
- A MongoDB instance (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- Git

### Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/kcea-attendance-system.git
   cd kcea-attendance-system
2. **Set your build command to**
   ```bash
   npm install && npm run build
3. **Start the server:**
   ```bash
   npm start   
