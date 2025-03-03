document.addEventListener("DOMContentLoaded", async () => {
  // Get DOM elements
  const markAttendanceBtn = document.getElementById("markAttendanceBtn");
  const statusMessage = document.getElementById("statusMessage");
  const video = document.getElementById("video");
  const mobileMenuButton = document.getElementById("mobileMenuButton");
  const mobileMenu = document.getElementById("mobile-menu");
  const mobileMenuIcon = document.getElementById("mobileMenuIcon");
  const downloadCsvBtn = document.getElementById("downloadCSVBtn");
  const downloadCsvBtnNav = document.getElementById("downloadCSVBtnNav");
  let storedDescriptor = null;
  let recognitionInterval;
  let canvas;

  mobileMenuButton.addEventListener("click", () => {
    mobileMenu.classList.toggle("hidden");
    // Toggle icon between hamburger and X
    if (mobileMenu.classList.contains("hidden")) {
      // Hamburger icon
      mobileMenuIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />`;
    } else {
      // X (close) icon
      mobileMenuIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />`;
    }
  });

  // Get roll number from URL query parameter (e.g., home.html?rollNumber=22B41A05A3)
  const urlParams = new URLSearchParams(window.location.search);
  const rollNumber = urlParams.get("rollNumber");
  if (!rollNumber) {
    statusMessage.innerText = "Roll number missing.";
    markAttendanceBtn.style.display = "none";
    return;
  }

  // Check attendance status from the backend
  try {
    const response = await fetch(`https://kcea-attendance-portal.onrender.com/api/attendanceStatus?rollNumber=${rollNumber}`);
    const data = await response.json();
    if (data.present) {
      statusMessage.innerText = "Attendance already marked.";
      markAttendanceBtn.style.display = "none";
      return; // Stop further processing if attendance is marked
    } else {
      statusMessage.innerText = "Attendance not marked. Please position your face for recognition.";
    }
  } catch (error) {
    console.error("Error fetching attendance status:", error);
    statusMessage.innerText = "Error loading attendance status.";
    markAttendanceBtn.style.display = "none";
    return;
  }

  // Fetch stored face descriptor for the given roll number
  try {
    const res = await fetch(`https://kcea-attendance-portal.onrender.com/api/getStudent?rollNumber=${rollNumber}`);
    const studentData = await res.json();
    if (studentData && studentData.faceDescriptor) {
      // Convert the stored array to a Float32Array for comparison
      storedDescriptor = new Float32Array(studentData.faceDescriptor);
    } else {
      statusMessage.innerText = "No stored face descriptor found. Cannot perform recognition.";
      markAttendanceBtn.style.display = "none";
      return;
    }
  } catch (error) {
    console.error("Error fetching student data:", error);
    statusMessage.innerText = "Error loading student data.";
    markAttendanceBtn.style.display = "none";
    return;
  }

  // Load face-api.js models from '/models'
  async function loadModels() {
    const MODEL_URL = '/models';
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
    ]);
    statusMessage.innerText = "Models loaded. Position your face in view.";
  }
  await loadModels();

  // Start webcam feed
  async function startVideo() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
      video.srcObject = stream;
      // Ensure video container is visible
      document.getElementById("videoContainer").classList.remove("hidden");
      document.getElementById("videoSection").classList.remove("hidden");
    } catch (err) {
      console.error("Error accessing webcam:", err);
      statusMessage.innerText = "Error accessing webcam.";
    }
  }
  await startVideo();

  // Wait for video metadata to load before creating the canvas
  video.addEventListener("loadedmetadata", () => {
    // const videoSection = document.getElementById("videoSection");
    // // Append the canvas within videoSection to avoid affecting overall layout
    // canvas = faceapi.createCanvasFromMedia(video);
    // canvas.classList.add("rounded-full");
    // videoContainer.appendChild(canvas);
    // const displaySize = { width: video.videoWidth, height: video.videoHeight };
    // faceapi.matchDimensions(canvas, displaySize);

    // Start continuous face detection every second
    recognitionInterval = setInterval(async () => {
      const detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();
      if (detection) {
        const liveDescriptor = detection.descriptor;
        const distance = faceapi.euclideanDistance(liveDescriptor, storedDescriptor);
        console.log("Distance:", distance);
        // If the distance is below threshold, consider it a match
        if (distance < 0.5) {
          statusMessage.innerText = "Face recognized. You can mark your attendance now.";
          document.getElementById("markAttendanceBtn").classList.remove("hidden");
          clearInterval(recognitionInterval); // Stop further detection

          // Stop video stream and hide video container (instead of removing to avoid layout shift)
          if (video.srcObject) {
            video.srcObject.getTracks().forEach(track => track.stop());
          }
          document.getElementById("videoContainer").classList.add("hidden");
          document.getElementById("videoSection").classList.add("hidden");
          if (canvas) {
            canvas.remove();
          }
        } else {
          statusMessage.innerText = "Face detected but not matching. Please adjust your position or lighting.";
        }
        // Draw detection results on canvas
        const resizedDetection = faceapi.resizeResults(detection, displaySize);
        const context = canvas.getContext("2d");
        context.clearRect(0, 0, canvas.width, canvas.height);
        faceapi.draw.drawDetections(canvas, resizedDetection);
      } else {
        statusMessage.innerText = "No face detected. Please position your face within the camera view.";
      }
    }, 1000);
  });

  // Manual override: if the user clicks the button, mark attendance manually
  markAttendanceBtn.addEventListener("click", async () => {
    try {
      const res = await fetch("https://kcea-attendance-portal.onrender.com/api/markAttendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rollNumber })
      });
      const result = await res.json();
      if (result.success) {
        statusMessage.innerText = "Attendance marked successfully.";
        document.getElementById("markAttendanceBtn").classList.add("hidden");
        alert(`Attendance marked successfully for ${rollNumber}.`);
        markAttendanceBtn.style.display = "none";
        if (video.srcObject) {
          video.srcObject.getTracks().forEach(track => track.stop());
        }
        document.getElementById("videoContainer").classList.add("hidden");
        if (canvas) {
          canvas.remove();
        }
      } else {
        statusMessage.innerText = "Failed to mark attendance: " + result.message;
      }
    } catch (error) {
      console.error("Error marking attendance:", error);
      statusMessage.innerText = "Error marking attendance.";
    }
  });


document.getElementById('downloadCompleteCSVBtn').addEventListener('click', () => {
  const rollNumber = document.getElementById('rollNumberCSV').value.trim();
  if (!rollNumber) {
    alert("Please enter your roll number.");
    return;
  }
  // Construct URL for complete attendance record download.
  // This endpoint should return all attendance records for the roll number.
  const url = 'https://kcea-attendance-portal.onrender.com/api/downloadCompleteAttendanceCSV?rollNumber=' + encodeURIComponent(rollNumber);
  window.location.href = url;
});


    downloadCsvBtn.addEventListener("click", function () {
      const dateInput = document.getElementById("csvDatePicker");
      if (dateInput) {
        const selectedDate = dateInput.value;
        if (selectedDate) {
          window.location.href = `https://kcea-attendance-portal.onrender.com/api/downloadAttendanceCSV ? date = ${selectedDate}`;
        } else {
          alert("Please select a date before downloading the CSV.");
        }
      } else {
        alert("Date input field not found!");
      }
    });
  

  
    downloadCsvBtnNav.addEventListener("click", function () {
      const dateInputNav = document.getElementById("csvDatePickerNav");
      if (dateInputNav) {
        const selectedDateNav = dateInputNav.value;
        if (selectedDateNav) {
          window.location.href = `https://kcea-attendance-portal.onrender.com/api/downloadAttendanceCSV ? date = ${ selectedDateNav }`;
        } else {
          alert("Please select a date before downloading the CSV.");
        }
      } else {
        alert("Date input field not found!");
      }
    });
  
  
});




