
document.addEventListener("DOMContentLoaded", async () => {
    const video = document.getElementById("video");
    const videoContainer = document.getElementById("videoContainer");
    const registerBtn = document.getElementById("registerBtn");
    const statusMessage = document.getElementById("info");
    let canvas = null;

    async function loadModels() {
        const MODEL_URL = "/models";
        await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
            faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
            faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        statusMessage.innerText = "Models loaded. Please position your face in view.";
    }

    async function startVideo() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
            video.srcObject = stream;
            videoContainer.classList.remove("hidden"); // Show the video container

            // Ensure only one canvas is created
            if (!canvas) {
                canvas = faceapi.createCanvasFromMedia(video);
                canvas.classList.add("absolute", "top-0", "left-0", "w-full", "h-full");
                videoContainer.appendChild(canvas);
            }

            const displaySize = { width: video.videoWidth, height: video.videoHeight };
            faceapi.matchDimensions(canvas, displaySize);
        } catch (err) {
            console.error("Error accessing webcam:", err);
            statusMessage.innerText = "Error accessing webcam.";
        }
    }

    async function detectFace() {
        const detectionInterval = setInterval(async () => {
            const detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
                .withFaceLandmarks()
                .withFaceDescriptor();

            if (detection) {
                document.getElementById("registerBtn").classList.remove("hidden");
                statusMessage.innerText = "Face detected. Click 'Register Face' to proceed.";
               
                clearInterval(detectionInterval); // Stop detection once a face is found
            } else {
                statusMessage.innerText = "No face detected. Please adjust your position.";
            }
        }, 1000);
    }

    registerBtn.addEventListener("click", async () => {
        statusMessage.innerText = "Registering face...";
        

        const detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceDescriptor();

        if (detection) {
            const faceDescriptor = Array.from(detection.descriptor);
            const rollNumber = new URLSearchParams(window.location.search).get("rollNumber");

            try {
                const res = await fetch("https://kcea-attendance-portal.onrender.com/api/registerFace", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ rollNumber, faceDescriptor })
                });

                const result = await res.json();
                if (result.success) {
                    document.getElementById("registerBtn").classList.add("hidden");
                    statusMessage.innerText = "Face registered successfully!";
                    setTimeout(() => window.location.href = "home.html?rollNumber=" + rollNumber, 2000);
                } else {
                    statusMessage.innerText = "Registration failed: " + result.message;
                }
            } catch (error) {
                console.error("Error registering face:", error);
                statusMessage.innerText = "Error registering face.";
            }
        } else {
            statusMessage.innerText = "Face detection failed. Try again.";
           
        }
    });

    await loadModels();
    await startVideo();
    await detectFace();
});
