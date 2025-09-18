import { useState, useCallback, useMemo } from "react";

interface CameraSettings {
  facingMode?: "user" | "environment";
  width?: { ideal: number; min: number };
  height?: { ideal: number; min: number };
}

interface CameraState {
  stream: MediaStream | null;
  isVideoReady: boolean;
  error: string;
  cameraStatus: string;
  debugInfo: Record<string, unknown>;
}

interface CameraActions {
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  forceVideoPlay: () => void;
}

export const useCamera = (
  videoRef: React.RefObject<HTMLVideoElement | null>,
  settings: CameraSettings = {}
): CameraState & CameraActions => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [error, setError] = useState<string>("");
  const [cameraStatus, setCameraStatus] = useState<string>("Not started");
  const [debugInfo, setDebugInfo] = useState<Record<string, unknown>>({});

  const defaultSettings = useMemo((): CameraSettings => ({
    facingMode: "environment",
    width: { ideal: 1280, min: 640 },
    height: { ideal: 720, min: 480 },
    ...settings,
  }), [settings]);

  const handleCameraError = useCallback(async (err: unknown) => {
    let errorMessage = "Unable to access camera.";

    if (err instanceof Error) {
      if (err.name === "NotAllowedError") {
        errorMessage = "Camera access denied. Please allow camera permissions and try again.";
      } else if (err.name === "NotFoundError") {
        errorMessage = "No camera found. Please connect a camera and try again.";
      } else if (err.name === "NotReadableError") {
        errorMessage = "Camera is already in use by another application.";
      } else if (err.name === "OverconstrainedError") {
        errorMessage = "Camera constraints not supported. Trying with default settings...";
        // Try again with simpler constraints
        try {
          const simpleStream = await navigator.mediaDevices.getUserMedia({
            video: true,
          });
          setStream(simpleStream);
          if (videoRef.current) {
            videoRef.current.srcObject = simpleStream;
            videoRef.current.onloadedmetadata = () => {
              videoRef.current?.play();
            };
          }
          return;
        } catch {
          errorMessage = "Camera access failed with simplified settings.";
        }
      } else {
        errorMessage = `Camera error: ${err.message}`;
      }
    }

    setError(errorMessage);
  }, [videoRef]);

  const startCamera = useCallback(async () => {
    try {
      setError("");
      setCameraStatus("Requesting camera access...");

      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera access is not supported in this browser");
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: defaultSettings,
      });

      // Get video track info
      const videoTrack = mediaStream.getVideoTracks()[0];
      if (videoTrack) {
        const trackSettings = videoTrack.getSettings();
        console.log("Video track settings:", trackSettings);
        setDebugInfo((prev) => ({ ...prev, trackSettings }));
      }

      setStream(mediaStream);
      setCameraStatus("Camera stream obtained, setting up video...");

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;

        // Force video properties
        videoRef.current.setAttribute("playsinline", "true");
        videoRef.current.setAttribute("muted", "true");
        videoRef.current.setAttribute("autoplay", "true");

        // Add event listeners
        videoRef.current.onloadedmetadata = () => {
          console.log("Video metadata loaded:", {
            videoWidth: videoRef.current?.videoWidth,
            videoHeight: videoRef.current?.videoHeight,
            readyState: videoRef.current?.readyState,
          });
          setCameraStatus("Video metadata loaded, starting playback...");
        };

        videoRef.current.oncanplay = () => {
          console.log("Video can play");
          setCameraStatus("Camera ready");
        };

        videoRef.current.onplaying = () => {
          console.log("Video is playing");
          setCameraStatus("Camera active");
          setIsVideoReady(true);
        };

        videoRef.current.onloadstart = () => {
          console.log("Video load started");
        };

        videoRef.current.onloadeddata = () => {
          console.log("Video data loaded");
        };

        videoRef.current.onerror = (e) => {
          console.error("Video error:", e);
          setError("Video loading error. Please check your camera and try again.");
        };
      }
    } catch (err) {
      console.error("Camera access error:", err);
      await handleCameraError(err);
    }
  }, [videoRef, defaultSettings, handleCameraError]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCameraStatus("Camera stopped");
    setIsVideoReady(false);
  }, [stream]);

  const forceVideoPlay = useCallback(() => {
    if (videoRef.current) {
      console.log("Forcing video play...");
      videoRef.current
        .play()
        .then(() => {
          console.log("Manual video play successful");
          setCameraStatus("Video manually started");
        })
        .catch((err) => {
          console.error("Manual video play failed:", err);
          setError(`Manual video play failed: ${err.message}`);
        });
    }
  }, [videoRef]);

  return {
    stream,
    isVideoReady,
    error,
    cameraStatus,
    debugInfo,
    startCamera,
    stopCamera,
    forceVideoPlay,
  };
};
