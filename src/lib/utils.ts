import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Preprocess image for OCR
export function preprocessImage(
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D
): HTMLCanvasElement {
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Convert to grayscale and enhance contrast
  for (let i = 0; i < data.length; i += 4) {
    const gray = Math.round(
      0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
    );

    // Enhance contrast for better OCR
    const enhanced =
      gray < 128 ? Math.max(0, gray - 50) : Math.min(255, gray + 50);

    data[i] = enhanced; // Red
    data[i + 1] = enhanced; // Green
    data[i + 2] = enhanced; // Blue
  }

  context.putImageData(imageData, 0, 0);
  return canvas;
}

// Extract card number region (simplified approach)
export function extractCardNumberRegion(
  canvas: HTMLCanvasElement
): HTMLCanvasElement {
  // Validate input canvas
  if (!canvas || canvas.width === 0 || canvas.height === 0) {
    throw new Error("Invalid canvas provided to extractCardNumberRegion");
  }

  // Card number is typically in the lower half of the card
  const regionHeight = Math.max(1, Math.floor(canvas.height * 0.3));
  const regionY = Math.floor(canvas.height * 0.4);

  const regionCanvas = document.createElement("canvas");
  regionCanvas.width = canvas.width;
  regionCanvas.height = regionHeight;

  const regionCtx = regionCanvas.getContext("2d")!;

  // Validate extraction parameters
  if (regionY + regionHeight > canvas.height) {
    console.warn(
      "Region extraction parameters exceed canvas bounds, adjusting..."
    );
    const adjustedHeight = canvas.height - regionY;
    regionCanvas.height = Math.max(1, adjustedHeight);
  }

  regionCtx.drawImage(
    canvas,
    0,
    regionY,
    canvas.width,
    regionCanvas.height,
    0,
    0,
    canvas.width,
    regionCanvas.height
  );

  return regionCanvas;
}

// Mask card number for privacy
export function getMaskedNumber(number: string): string {
  if (number.length !== 16) return number;
  return `**** **** **** ${number.slice(-4)}`;
}

export function drawDetectionOverlay(
  overlayCanvas: HTMLCanvasElement,
  video: HTMLVideoElement,
  cardNumber: string,
  confidence: number
) {
  const ctx = overlayCanvas.getContext("2d")!;

  overlayCanvas.width = video.videoWidth;
  overlayCanvas.height = video.videoHeight;

  // Clear previous overlay
  ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

  // Draw card detection box with modern styling
  const gradient = ctx.createLinearGradient(0, 0, overlayCanvas.width, 0);
  gradient.addColorStop(0, confidence > 80 ? "#10b981" : "#f59e0b");
  gradient.addColorStop(1, confidence > 80 ? "#059669" : "#d97706");
  
  ctx.strokeStyle = gradient;
  ctx.lineWidth = 4;
  ctx.setLineDash([]);
  ctx.shadowColor = confidence > 80 ? "#10b981" : "#f59e0b";
  ctx.shadowBlur = 10;

  const boxWidth = overlayCanvas.width * 0.8;
  const boxHeight = overlayCanvas.height * 0.3;
  const boxX = (overlayCanvas.width - boxWidth) / 2;
  const boxY = overlayCanvas.height * 0.4;

  ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

  // Reset shadow for text
  ctx.shadowBlur = 0;
  
  // Draw confidence indicator with better styling
  ctx.fillStyle = confidence > 80 ? "#10b981" : "#f59e0b";
  ctx.font = "bold 18px 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillText(`✓ ${confidence.toFixed(1)}% Confidence`, boxX, boxY - 15);
}
