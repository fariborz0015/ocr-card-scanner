"use client";

import React, { useState } from "react";
import {
  Camera,
  CameraOff,
  Scan,
  AlertCircle,
  Shield,
  Eye,
  EyeOff,
} from "lucide-react";
import { useCardScanner } from "@/hooks/useCardScanner";
import { getMaskedNumber } from "@/lib/utils";

const CardScanner: React.FC = () => {
  // Local state for UI
  const [showFullNumber, setShowFullNumber] = useState(false);

  // Use the custom hook for all scanner functionality
  const {
    // State
    stream,
    isVideoReady,
    cameraStatus,
    debugInfo,
    tesseractWorker,
    isInitializingOCR,
    ocrRetryCount,
    isScanning,
    isProcessing,
    detectedCard,
    error,
    // Refs
    videoRef,
    canvasRef,
    overlayCanvasRef,
    // Actions
    startCamera,
    stopCamera,
    forceVideoPlay,
    toggleScanning,
    retryOCRInit,
  } = useCardScanner();

  // Handle scanning toggle with error feedback
  const handleToggleScanning = () => {
    if (
      !isScanning &&
      videoRef.current &&
      (videoRef.current.readyState < 2 || videoRef.current.videoWidth === 0)
    ) {
      // We could show a toast notification here instead of setting error directly
      console.warn(
        "Please wait for the camera to load completely before scanning."
      );
      return;
    }
    toggleScanning();
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <div className="relative bg-white/5 backdrop-blur-xl border-b border-white/10 p-6 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Card Scanner
              </h1>
              <p className="text-sm text-white/60">Secure • Local • Private</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full backdrop-blur-sm">
              <div
                className={`w-2 h-2 rounded-full animate-pulse ${
                  isVideoReady
                    ? "bg-emerald-400 shadow-emerald-400/50 shadow-lg"
                    : "bg-gray-400"
                }`}
              ></div>
              <span className="text-xs text-white/80 font-medium">
                {cameraStatus}
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 rounded-full backdrop-blur-sm border border-emerald-400/30">
              <Shield className="h-3 w-3 text-emerald-400" />
              <span className="text-xs text-emerald-300 font-medium">
                100% Local
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Camera View */}
      <div className="flex-1 relative bg-black rounded-t-3xl overflow-hidden shadow-2xl border border-white/10">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
          autoPlay
          controls={false}
          style={{
            backgroundColor: "#000",
            display: "block",
            minHeight: "200px",
          }}
          onError={(e) => {
            console.error("Video element error:", e);
          }}
        />

        {/* Overlay Canvas */}
        <canvas
          ref={overlayCanvasRef}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />

        {/* Enhanced Scanning Guide */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative">
            <div className="w-80 h-48 relative">
              {/* Main scanning frame with glass morphism */}
              <div className="w-full h-full bg-white/5 backdrop-blur-sm border-2 border-blue-400/50 rounded-2xl flex items-center justify-center shadow-2xl ring-1 ring-white/10">
                {/* Scanning animation */}
                {isScanning && (
                  <div className="absolute inset-0 border-2 border-blue-400 rounded-2xl animate-pulse opacity-50"></div>
                )}

                <div className="text-white text-center z-10">
                  <div className="relative">
                    <Scan
                      className={`h-8 w-8 mx-auto mb-3 text-blue-400 ${
                        isScanning ? "animate-spin" : "animate-pulse"
                      }`}
                    />
                    {isScanning && (
                      <div className="absolute inset-0 h-8 w-8 mx-auto bg-blue-400 rounded-full animate-ping opacity-20"></div>
                    )}
                  </div>
                  <p className="text-sm font-medium mb-1">
                    {isScanning ? "Scanning..." : "Position your card here"}
                  </p>
                  <p className="text-xs text-white/60">
                    Card number should be clearly visible
                  </p>
                </div>
              </div>

              {/* Animated corner indicators */}
              <div className="absolute -top-2 -left-2 w-8 h-8 border-l-4 border-t-4 border-blue-400 rounded-tl-lg animate-pulse"></div>
              <div className="absolute -top-2 -right-2 w-8 h-8 border-r-4 border-t-4 border-blue-400 rounded-tr-lg animate-pulse"></div>
              <div className="absolute -bottom-2 -left-2 w-8 h-8 border-l-4 border-b-4 border-blue-400 rounded-bl-lg animate-pulse"></div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 border-r-4 border-b-4 border-blue-400 rounded-br-lg animate-pulse"></div>

              {/* Scanning line animation */}
              {isScanning && (
                <div className="absolute inset-0 overflow-hidden rounded-2xl">
                  <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-scan-line"></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* OCR Initialization Status */}
      {isInitializingOCR && !error && (
        <div className="relative mx-6 mb-4">
          <div className="bg-white/10 backdrop-blur-xl border border-blue-500/30 p-6 rounded-2xl shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="animate-spin h-6 w-6 border-3 border-blue-400 border-t-transparent rounded-full"></div>
                <div className="absolute inset-0 h-6 w-6 border-3 border-blue-400/20 rounded-full animate-pulse"></div>
              </div>
              <div>
                <span className="font-semibold text-white text-lg">
                  Initializing OCR Engine
                </span>
                <p className="text-white/60 text-sm mt-1">
                  Preparing neural networks for text recognition...
                </p>
              </div>
            </div>
            <div className="mt-4 h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-loading-bar"></div>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="relative mx-6 mb-4">
          <div className="bg-red-500/10 backdrop-blur-xl border border-red-500/30 p-6 rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/20 rounded-full">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                </div>
                <div>
                  <span className="font-semibold text-red-300 text-lg">
                    {error}
                  </span>
                  {error.includes("OCR") && (
                    <p className="text-red-400/60 text-sm mt-1">
                      {ocrRetryCount === 0 &&
                        "Network issue detected. Trying alternative approach..."}
                      {ocrRetryCount === 1 &&
                        "Using fallback initialization method..."}
                      {ocrRetryCount >= 2 &&
                        "Multiple failures detected. Please refresh the page."}
                    </p>
                  )}
                </div>
              </div>
              {error.includes("OCR") && ocrRetryCount < 3 && (
                <button
                  onClick={retryOCRInit}
                  className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl font-medium transition-all duration-300 border border-red-500/30 hover:border-red-500/50"
                >
                  Retry
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Detection Result */}
      {detectedCard && (
        <div className="relative mx-6 mb-4">
          <div className="bg-white/10 backdrop-blur-xl border border-emerald-500/30 p-6 rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 rounded-full">
                  <Shield className="h-5 w-5 text-emerald-400" />
                </div>
                <h3 className="font-semibold text-white text-lg">
                  Card Detected Successfully
                </h3>
              </div>
              <button
                onClick={() => setShowFullNumber(!showFullNumber)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white/80 hover:text-white rounded-full transition-all duration-300 text-sm font-medium"
              >
                {showFullNumber ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                {showFullNumber ? "Hide" : "Show"}
              </button>
            </div>

            <div className="bg-black/20 p-4 rounded-xl border border-white/10 mb-4">
              <div className="font-mono text-2xl text-white tracking-wider">
                {showFullNumber
                  ? detectedCard.number.replace(/(.{4})/g, "$1 ").trim()
                  : getMaskedNumber(detectedCard.number)}
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-emerald-300 font-medium">
                  {detectedCard.confidence.toFixed(1)}% Confidence
                </span>
              </div>
              <span className="text-white/60">
                {new Date(detectedCard.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="relative bg-white/5 backdrop-blur-xl border-t border-white/10 p-6">
        <div className="flex gap-4 justify-center flex-wrap">
          {!stream ? (
            <button
              onClick={startCamera}
              className="group relative flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform"
            >
              <Camera className="h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
              Start Camera
              <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          ) : (
            <>
              <button
                onClick={stopCamera}
                className="group relative flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30 px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 transform"
              >
                <CameraOff className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                Stop Camera
              </button>

              {stream && !isVideoReady && (
                <button
                  onClick={forceVideoPlay}
                  className="group relative flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform"
                >
                  Play Video
                  <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              )}

              <button
                onClick={handleToggleScanning}
                disabled={
                  !tesseractWorker || isInitializingOCR || !isVideoReady
                }
                className={`group relative flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform ${
                  isScanning
                    ? "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white hover:scale-105"
                    : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white hover:scale-105"
                } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
              >
                <Scan
                  className={`h-6 w-6 transition-transform duration-300 ${
                    isScanning ? "animate-spin" : "group-hover:scale-110"
                  }`}
                />
                {isInitializingOCR
                  ? "Initializing OCR..."
                  : !isVideoReady
                  ? "Waiting for camera..."
                  : isScanning
                  ? "Stop Scanning"
                  : "Start Scanning"}
                {!isScanning && !isInitializingOCR && isVideoReady && (
                  <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                )}
              </button>
            </>
          )}
        </div>

        {/* Debug Information */}
        {(debugInfo.trackSettings || stream) && (
          <div className="text-center mt-6">
            <details className="group">
              <summary className="cursor-pointer text-white/60 hover:text-white/80 transition-colors duration-300 list-none">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 hover:border-white/20 transition-all duration-300">
                  <span className="text-xs font-medium">Debug Information</span>
                  <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                </div>
              </summary>
              <div className="mt-4 mx-auto max-w-md">
                <div className="bg-black/40 backdrop-blur-sm border border-white/10 p-4 rounded-xl text-left space-y-2">
                  <div className="text-xs text-white/80">
                    <span className="text-blue-400 font-medium">Stream:</span>{" "}
                    {stream?.active ? "Active" : "Inactive"}
                  </div>
                  <div className="text-xs text-white/80">
                    <span className="text-blue-400 font-medium">Tracks:</span>{" "}
                    {stream?.getVideoTracks().length || 0}
                  </div>
                  {debugInfo.trackSettings && (
                    <>
                      <div className="text-xs text-white/80">
                        <span className="text-blue-400 font-medium">
                          Resolution:
                        </span>{" "}
                        {debugInfo.trackSettings.width}x
                        {debugInfo.trackSettings.height}
                      </div>
                      <div className="text-xs text-white/80">
                        <span className="text-blue-400 font-medium">
                          Frame Rate:
                        </span>{" "}
                        {debugInfo.trackSettings.frameRate}
                      </div>
                      <div className="text-xs text-white/80">
                        <span className="text-blue-400 font-medium">
                          Camera:
                        </span>{" "}
                        {debugInfo.trackSettings.facingMode}
                      </div>
                    </>
                  )}
                  {videoRef.current && (
                    <>
                      <div className="text-xs text-white/80">
                        <span className="text-blue-400 font-medium">
                          State:
                        </span>{" "}
                        {videoRef.current.readyState}
                      </div>
                      <div className="text-xs text-white/80">
                        <span className="text-blue-400 font-medium">Size:</span>{" "}
                        {videoRef.current.videoWidth}x
                        {videoRef.current.videoHeight}
                      </div>
                      <div className="text-xs text-white/80">
                        <span className="text-blue-400 font-medium">
                          Playing:
                        </span>{" "}
                        {videoRef.current.paused ? "No" : "Yes"}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </details>
          </div>
        )}
      </div>

      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CardScanner;
