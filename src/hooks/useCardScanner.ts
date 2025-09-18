import { useRef, useState, useCallback, useEffect } from "react";
import { useCamera } from "./useCamera";
import { useOCR } from "./useOCR";
import { preprocessImage, extractCardNumberRegion, drawDetectionOverlay } from "@/lib/utils";

interface DetectedCard {
  number: string;
  confidence: number;
  timestamp: number;
}

interface CardScannerState {
  // Camera state
  stream: MediaStream | null;
  isVideoReady: boolean;
  cameraStatus: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  debugInfo: any;
  
  // OCR state
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tesseractWorker: any;
  isInitializingOCR: boolean;
  ocrRetryCount: number;
  
  // Scanning state
  isScanning: boolean;
  isProcessing: boolean;
  detectedCard: DetectedCard | null;
  
  // Error state
  error: string;
  
  // Refs
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  overlayCanvasRef: React.RefObject<HTMLCanvasElement | null>;
}

interface CardScannerActions {
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  forceVideoPlay: () => void;
  toggleScanning: () => void;
  retryOCRInit: () => void;
}

export const useCardScanner = (): CardScannerState & CardScannerActions => {
  // Refs for video and canvas elements
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);

  // Scanning state
  const [isScanning, setIsScanning] = useState(false);
  const [detectedCard, setDetectedCard] = useState<DetectedCard | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Custom hooks
  const camera = useCamera(videoRef);
  const ocr = useOCR();

  // Combine errors from camera and OCR
  const error = camera.error || ocr.error;

  // Process frame for OCR
  const processFrame = useCallback(async () => {
    if (
      !videoRef.current ||
      !canvasRef.current ||
      !ocr.tesseractWorker ||
      isProcessing
    ) {
      return;
    }

    const video = videoRef.current;

    // Check if video is ready and has valid dimensions
    if (
      video.readyState < 2 ||
      video.videoWidth === 0 ||
      video.videoHeight === 0
    ) {
      console.log("Video not ready for processing:", {
        readyState: video.readyState,
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
      });
      return;
    }

    setIsProcessing(true);

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d")!;

      // Set canvas size to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Validate canvas dimensions
      if (canvas.width === 0 || canvas.height === 0) {
        console.log("Canvas has invalid dimensions:", {
          width: canvas.width,
          height: canvas.height,
        });
        setIsProcessing(false);
        return;
      }

      // Draw current video frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Extract card number region
      let cardRegion: HTMLCanvasElement;
      try {
        cardRegion = extractCardNumberRegion(canvas);
      } catch (regionError) {
        console.error("Error extracting card region:", regionError);
        setIsProcessing(false);
        return;
      }

      // Preprocess for OCR
      const processedRegion = preprocessImage(
        cardRegion,
        cardRegion.getContext("2d")!
      );

      // Convert to blob for OCR
      processedRegion.toBlob(async (blob) => {
        if (!blob) return;

        try {
          const { text, confidence } = await ocr.recognizeText(blob);
          console.log(text);
          
          // Extract card number pattern (simplified)
          const numberMatch = text.match(/(\d{4}\s?\d{4}\s?\d{4}\s?\d{4})/);

          if (numberMatch && confidence > 60) {
            const cardNumber = numberMatch[1].replace(/\s/g, "");

            if (cardNumber.length === 16) {
              setDetectedCard({
                number: cardNumber,
                confidence,
                timestamp: Date.now(),
              });

              // Draw detection overlay
              drawDetectionOverlay(
                overlayCanvasRef.current!,
                videoRef.current!,
                cardNumber,
                confidence
              );
            }
          }
        } catch (ocrError) {
          console.error("OCR processing error:", ocrError);
        } finally {
          setIsProcessing(false);
        }
      }, "image/png");
    } catch (err) {
      console.error("Frame processing error:", err);
      setIsProcessing(false);
    }
  }, [isProcessing, ocr]);

  // Start/stop scanning
  const toggleScanning = useCallback(() => {
    if (isScanning) {
      setIsScanning(false);
    } else {
      // Check if video is ready before starting scan
      if (
        videoRef.current &&
        videoRef.current.readyState >= 2 &&
        videoRef.current.videoWidth > 0
      ) {
        setIsScanning(true);
        setDetectedCard(null);
      } else {
        // This would need to be handled by the component using this hook
        console.error("Please wait for the camera to load completely before scanning.");
      }
    }
  }, [isScanning]);

  // Scanning interval
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isScanning && camera.stream) {
      interval = setInterval(processFrame, 1000); // Process every second
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isScanning, camera.stream, processFrame]);

  return {
    // Camera state
    stream: camera.stream,
    isVideoReady: camera.isVideoReady,
    cameraStatus: camera.cameraStatus,
    debugInfo: camera.debugInfo,
    
    // OCR state
    tesseractWorker: ocr.tesseractWorker,
    isInitializingOCR: ocr.isInitializingOCR,
    ocrRetryCount: ocr.ocrRetryCount,
    
    // Scanning state
    isScanning,
    isProcessing,
    detectedCard,
    
    // Error state
    error,
    
    // Refs
    videoRef,
    canvasRef,
    overlayCanvasRef,
    
    // Actions
    startCamera: camera.startCamera,
    stopCamera: camera.stopCamera,
    forceVideoPlay: camera.forceVideoPlay,
    toggleScanning,
    retryOCRInit: ocr.retryOCRInit,
  };
};
