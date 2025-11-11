export default class CameraUtils {
  constructor() {
    this.stream = null;
    this.videoElement = null;
  }

  /**
   * Start the camera and attach it to a video element
   * @param {HTMLVideoElement} videoElement - The video element to attach the stream to
   * @param {object} options - Camera options (facingMode, etc.)
   * @returns {Promise<MediaStream>} - The camera stream
   */
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

        // Return a promise that resolves when video is ready
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

  /**
   * Stop the camera stream
   */
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

  /**
   * Capture an image from the video element
   * @param {HTMLVideoElement} videoElement - The video element to capture from
   * @returns {string} - Data URL of the captured image
   */
  captureImage(videoElement) {
    if (!videoElement) {
      throw new Error("Video element is required");
    }

    const canvas = document.createElement("canvas");
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoElement, 0, 0);

    return canvas.toDataURL("image/png");
  }

  /**
   * Check if camera is currently active
   * @returns {boolean}
   */
  isActive() {
    return this.stream !== null && this.stream.active;
  }

  /**
   * Get the current stream
   * @returns {MediaStream|null}
   */
  getStream() {
    return this.stream;
  }

  /**
   * Switch between front and back camera
   * @param {HTMLVideoElement} videoElement
   * @param {string} facingMode - 'user' or 'environment'
   * @returns {Promise<MediaStream>}
   */
  async switchCamera(videoElement, facingMode = "environment") {
    this.stopCamera();
    return this.startCamera(videoElement, { facingMode });
  }
}
