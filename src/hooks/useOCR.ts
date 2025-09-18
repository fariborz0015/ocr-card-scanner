import { useState, useEffect, useCallback } from "react";
import Tesseract from "tesseract.js";

// Helper function to check if a URL is accessible
const checkUrlAccessibility = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: "HEAD", mode: "cors" });
    return response.ok;
  } catch {
    return false;
  }
};

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

        // Detect environment and configure paths

        // Define multiple fallback configurations
        const workerConfigs = [
          // Config 1: Local WASM files (preferred for self-hosted)
          {
            name: "Local WASM files",
            workerPath: "/wasm/worker.min.js",
            corePath: "/wasm/tesseract-core-simd.wasm.js",
          },
          // Config 2: jsDelivr CDN
          {
            name: "jsDelivr CDN",
            workerPath:
              "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/worker.min.js",
            corePath:
              "https://cdn.jsdelivr.net/npm/tesseract.js-core@5/tesseract-core-simd.wasm.js",
            options: {
              langPath:
                "https://cdn.jsdelivr.net/npm/tesseract.js-core@5/lang-data/",
            },
          },
          // Config 3: unpkg CDN
          {
            name: "unpkg CDN",
            workerPath: "https://unpkg.com/tesseract.js@5/dist/worker.min.js",
            corePath:
              "https://unpkg.com/tesseract.js-core@5/tesseract-core-simd.wasm.js",
            options: {
              langPath: "https://unpkg.com/tesseract.js-core@5/lang-data/",
            },
          },
          // Config 4: Default bundled (final fallback)
          {
            name: "Default bundled",
            workerPath: undefined,
            corePath: undefined,
            options: {},
          },
        ];

        const currentConfig =
          workerConfigs[Math.min(ocrRetryCount, workerConfigs.length - 1)];
        console.log(
          `Attempt ${ocrRetryCount + 1}: Using ${currentConfig.name}`
        );

        // Pre-check URLs if they're external
        if (
          currentConfig.workerPath &&
          currentConfig.workerPath.startsWith("http")
        ) {
          console.log("Checking CDN accessibility...");
          const workerAccessible = await checkUrlAccessibility(
            currentConfig.workerPath
          );
          const coreAccessible = await checkUrlAccessibility(
            currentConfig.corePath!
          );

          if (!workerAccessible || !coreAccessible) {
            throw new Error(
              `CDN files not accessible (worker: ${workerAccessible}, core: ${coreAccessible})`
            );
          }
          console.log("CDN accessibility check passed");
        }

        // Create worker with current configuration
        const workerOptions = {
          logger: (m: Tesseract.LoggerMessage) => {
            if (m.status === "recognizing text") {
              console.log(`OCR Progress: ${(m.progress * 100).toFixed(1)}%`);
            } else if (m.status !== "recognizing text") {
              console.log(
                `OCR Status: ${m.status}${
                  m.progress ? ` (${(m.progress * 100).toFixed(1)}%)` : ""
                }`
              );
            }
          },
          ...currentConfig.options,
          ...(currentConfig.workerPath && {
            workerPath: currentConfig.workerPath,
          }),
          ...(currentConfig.corePath && { corePath: currentConfig.corePath }),
        };

        console.log("Creating worker with options:", {
          workerPath: workerOptions.workerPath || "default",
          corePath: workerOptions.corePath || "default",
        });

        const worker = await Tesseract.createWorker("eng", 1, workerOptions);

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
          const errorMessage =
            err instanceof Error ? err.message : "Unknown error";
          console.error("OCR Worker Error Details:", errorMessage);

          // Auto-retry up to 3 times before showing error
          if (ocrRetryCount < 3) {
            console.log(
              `Auto-retrying OCR initialization (attempt ${
                ocrRetryCount + 2
              }/4)`
            );
            setTimeout(() => {
              if (isMounted) {
                setOcrRetryCount((prev) => prev + 1);
              }
            }, 2000); // Wait 2 seconds before retry
          } else {
            setError(
              `Failed to initialize OCR engine after ${
                ocrRetryCount + 1
              } attempts: ${errorMessage}`
            );
            setIsInitializingOCR(false);
          }
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
