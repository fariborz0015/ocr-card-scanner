import { useState, useEffect, useCallback } from "react";
import Tesseract from "tesseract.js";

interface OCRState {
  tesseractWorker: Tesseract.Worker | null;
  isInitializingOCR: boolean;
  ocrRetryCount: number;
  error: string;
}

interface OCRActions {
  retryOCRInit: () => void;
  recognizeText: (blob: Blob) => Promise<{ text: string; confidence: number }>;
}

export const useOCR = (): OCRState & OCRActions => {
  const [tesseractWorker, setTesseractWorker] =
    useState<Tesseract.Worker | null>(null);
  const [isInitializingOCR, setIsInitializingOCR] = useState(true);
  const [ocrRetryCount, setOcrRetryCount] = useState(0);
  const [error, setError] = useState<string>("");

  // Initialize Tesseract worker
  useEffect(() => {
    let isMounted = true;

    const initWorker = async () => {
      try {
        setError(""); // Clear any previous errors
        setIsInitializingOCR(true);
        console.log("Initializing OCR worker...");

        // Try different initialization approaches based on retry count
        let worker;
        if (ocrRetryCount === 0) {
          // First attempt: use CDN paths
          worker = await Tesseract.createWorker("eng", 1, {
            logger: (m) => {
              if (m.status === "recognizing text") {
                console.log(`OCR Progress: ${(m.progress * 100).toFixed(1)}%`);
              }
            },
            workerPath: "/wasm/worker.min.js",

            corePath: "/wasm/tesseract-core-simd.wasm.js",
          });
        } else {
          // Fallback: use default paths (bundled)
          worker = await Tesseract.createWorker("eng", 1, {
            logger: (m) => {
              if (m.status === "recognizing text") {
                console.log(`OCR Progress: ${(m.progress * 100).toFixed(1)}%`);
              }
            },
          });
        }

        // Only set worker if component is still mounted
        if (isMounted) {
          console.log("OCR worker created successfully");
          console.log("OCR worker configured successfully");
          setTesseractWorker(worker);
          setIsInitializingOCR(false);
        } else {
          // Component unmounted, cleanup
          await worker.terminate();
        }
      } catch (err) {
        console.error("Failed to initialize OCR worker:", err);
        if (isMounted) {
          setError(
            `Failed to initialize OCR engine: ${
              err instanceof Error ? err.message : "Unknown error"
            }`
          );
          setIsInitializingOCR(false);
        }
      }
    };

    // Only initialize if we don't already have a worker
    if (!tesseractWorker) {
      initWorker();
    }

    return () => {
      isMounted = false;
      if (tesseractWorker) {
        tesseractWorker.terminate().catch(console.error);
      }
    };
  }, [ocrRetryCount, tesseractWorker]); // Trigger on retry count changes

  const retryOCRInit = useCallback(() => {
    setOcrRetryCount((prev: number) => prev + 1);
    setError("");
    setIsInitializingOCR(true);
    // The useEffect will trigger with the new retry count
  }, []);

  const recognizeText = useCallback(
    async (blob: Blob): Promise<{ text: string; confidence: number }> => {
      if (!tesseractWorker) {
        throw new Error("OCR worker not initialized");
      }

      const {
        data: { text, confidence },
      } = await tesseractWorker.recognize(blob);

      return { text, confidence };
    },
    [tesseractWorker]
  );

  return {
    tesseractWorker,
    isInitializingOCR,
    ocrRetryCount,
    error,
    retryOCRInit,
    recognizeText,
  };
};
