export default class CameraUtils {
  constructor() {
    this.stream = null;
    this.videoElement = null;
    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.recordingMimeType = null;
  }

  async startCamera(videoElement, options = {}) {
    try {
      const defaultOptions = {
        video: { facingMode: options.facingMode || "environment" },
        audio: false,
      };

      this.stream = await navigator.mediaDevices.getUserMedia(defaultOptions);
      this.videoElement = videoElement;

      if (videoElement) {
        videoElement.srcObject = this.stream;

        return new Promise((resolve, reject) => {
          videoElement.onloadedmetadata = () => {
            videoElement
              .play()
              .then(() => resolve(this.stream))
              .catch(reject);
          };
        });
      }

      return this.stream;
    } catch (error) {
      console.error("Error accessing camera:", error);
      throw error;
    }
  }

  startRecording() {
    if (!this.stream) {
      throw new Error("No camera stream available");
    }

    this.recordedChunks = [];

    const options = {
      mimeType: "video/mp4",
    };

    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      options.mimeType = "video/webm;codecs=h264";
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = "video/webm";
      }
    }

    this.mediaRecorder = new MediaRecorder(this.stream, options);
    this.recordingMimeType = options.mimeType;

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.recordedChunks.push(event.data);
      }
    };

    this.mediaRecorder.start();
  }

  async stopRecording() {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        resolve(null);
        return;
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, {
          type: this.recordingMimeType || "video/mp4",
        });
        resolve(blob);
      };

      this.mediaRecorder.onerror = (error) => {
        reject(error);
      };

      this.mediaRecorder.stop();
    });
  }

  isRecording() {
    return this.mediaRecorder && this.mediaRecorder.state === "recording";
  }

  stopCamera() {
    if (this.mediaRecorder && this.mediaRecorder.state === "recording") {
      this.mediaRecorder.stop();
    }
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    if (this.videoElement) {
      this.videoElement.srcObject = null;
      this.videoElement = null;
    }
    this.mediaRecorder = null;
    this.recordedChunks = [];
  }

  isActive() {
    return this.stream !== null && this.stream.active;
  }

  getStream() {
    return this.stream;
  }

  async switchCamera(videoElement, facingMode = "environment") {
    this.stopCamera();
    return this.startCamera(videoElement, { facingMode });
  }
}
