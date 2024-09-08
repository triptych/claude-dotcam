const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const video = document.createElement("video");
const pauseResumeButton = document.getElementById("pauseResume");
const takeSnapshotButton = document.getElementById("takeSnapshot");
const dotSizeInput = document.getElementById("dotSize");
const dotSpacingInput = document.getElementById("dotSpacing");
const errorMessage = document.getElementById("errorMessage");
const loading = document.getElementById("loading");

let isPlaying = true;
let dotSize = 5;
let dotSpacing = 8;
let animationId = null;

const MAX_BRIGHTNESS = 255;

function setCanvasSize() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight * 0.8;
}

function startVideoStream() {
	navigator.mediaDevices
		.getUserMedia({ video: true })
		.then((stream) => {
			video.srcObject = stream;
			video.play();
			loading.style.display = "none";
		})
		.catch((err) => {
			console.error("Error accessing the camera:", err);
			errorMessage.textContent =
				"Error accessing the camera. Please make sure you have given permission and your camera is working.";
			loading.style.display = "none";
		});
}

function drawDot(x, y, r, g, b, brightness) {
	ctx.fillStyle = `rgb(${r},${g},${b})`;
	ctx.beginPath();
	ctx.arc(
		x * dotSpacing,
		y * dotSpacing,
		dotSize * (brightness / MAX_BRIGHTNESS),
		0,
		Math.PI * 2
	);
	ctx.fill();
}

function processFrame() {
	ctx.fillStyle = "#000";
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	const tempCanvas = document.createElement("canvas");
	const tempCtx = tempCanvas.getContext("2d");
	tempCanvas.width = canvas.width / dotSpacing;
	tempCanvas.height = canvas.height / dotSpacing;

	tempCtx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
	const imageData = tempCtx.getImageData(
		0,
		0,
		tempCanvas.width,
		tempCanvas.height
	);
	const data = imageData.data;

	for (let y = 0; y < tempCanvas.height; y++) {
		for (let x = 0; x < tempCanvas.width; x++) {
			const i = (y * tempCanvas.width + x) * 4;
			const r = data[i];
			const g = data[i + 1];
			const b = data[i + 2];
			const brightness = (r + g + b) / 3;

			drawDot(x, y, r, g, b, brightness);
		}
	}
}

function animate() {
	if (isPlaying) {
		processFrame();
	}
	animationId = requestAnimationFrame(animate);
}

function togglePlayPause() {
	isPlaying = !isPlaying;
	pauseResumeButton.textContent = isPlaying ? "Pause" : "Resume";
}

function takeSnapshot() {
	const dataURL = canvas.toDataURL("image/png");
	const link = document.createElement("a");
	link.href = dataURL;
	link.download = "dot-grid-snapshot.png";
	link.click();
}

video.addEventListener("loadedmetadata", () => {
	animate();
});

pauseResumeButton.addEventListener("click", togglePlayPause);
takeSnapshotButton.addEventListener("click", takeSnapshot);

dotSizeInput.addEventListener("input", (e) => {
	dotSize = parseInt(e.target.value);
});

dotSpacingInput.addEventListener("input", (e) => {
	dotSpacing = parseInt(e.target.value);
});

window.addEventListener("resize", setCanvasSize);

setCanvasSize();
startVideoStream();

// Fallback for browsers that don't support getUserMedia
if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
	errorMessage.textContent =
		"Sorry, your browser doesn't support accessing the camera.";
	loading.style.display = "none";
}
