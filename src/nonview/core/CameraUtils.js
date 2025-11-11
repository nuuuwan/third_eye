export default class CameraUtils {
  constructor() {
    this.stream = null;
    this.videoElement = null;
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

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    if (this.videoElement) {
      this.videoElement.srcObject = null;
      this.videoElement = null;
    }
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
