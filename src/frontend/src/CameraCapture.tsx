import {
  AlertCircle,
  Camera,
  Check,
  Droplets,
  Loader2,
  RotateCcw,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { ExternalBlob } from "./backend";
import { useCamera } from "./camera/useCamera";

interface Props {
  onCapture: (photoUrl: string) => void;
  onCancel: () => void;
}

export default function CameraCapture({ onCapture, onCancel }: Props) {
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);

  const {
    isActive,
    isLoading,
    error,
    startCamera,
    stopCamera,
    capturePhoto,
    switchCamera,
    videoRef,
    canvasRef,
  } = useCamera({
    facingMode: "environment",
    quality: 0.85,
    format: "image/jpeg",
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: start/stop camera on mount only
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const handleCapture = async () => {
    setCapturing(true);
    setTimeout(() => setCapturing(false), 400);
    const file = await capturePhoto();
    if (file) {
      setCapturedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      stopCamera();
    }
  };

  const handleRetake = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setCapturedFile(null);
    setPreviewUrl(null);
    setUploadError(null);
    startCamera();
  };

  const handleConfirm = async () => {
    if (!capturedFile) return;
    setUploading(true);
    setUploadError(null);
    try {
      const bytes = new Uint8Array(await capturedFile.arrayBuffer());
      const blob = ExternalBlob.fromBytes(bytes);
      const url = blob.getDirectURL();
      onCapture(url);
    } catch {
      setUploadError("Failed to upload photo. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-IN");
  const dateStr = now.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-black flex flex-col relative">
      {/* Cancel button */}
      <div className="absolute top-4 left-4 z-20">
        <button
          type="button"
          onClick={onCancel}
          className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-all"
          style={{
            background: "oklch(0 0 0 / 0.55)",
            border: "1px solid oklch(1 0 0 / 0.18)",
          }}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Camera viewport */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Captured"
            className="w-full h-full object-cover"
          />
        ) : (
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              style={{ minHeight: "60vh" }}
              playsInline
              muted
            />
            <canvas ref={canvasRef} className="hidden" />
          </>
        )}

        {/* Flash overlay on capture */}
        {capturing && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "oklch(1 0 0 / 0.65)",
              animation: "waterRise 0.35s ease-out",
              zIndex: 10,
            }}
          />
        )}

        {/* Corner viewfinder guides */}
        {!previewUrl &&
          isActive &&
          [
            "top-6 left-6",
            "top-6 right-6",
            "bottom-6 left-6",
            "bottom-6 right-6",
          ].map((pos) => (
            <div
              key={pos}
              className={`absolute ${pos} w-8 h-8 pointer-events-none`}
              style={{
                borderColor: "oklch(0.56 0.18 240 / 0.8)",
                borderStyle: "solid",
                borderWidth: pos.includes("top")
                  ? "3px 0 0 3px"
                  : pos.includes("bottom-6 left")
                    ? "0 0 3px 3px"
                    : "0 3px 3px 0",
                borderRadius: pos.includes("top-6 left")
                  ? "4px 0 0 0"
                  : pos.includes("top-6 right")
                    ? "0 4px 0 0"
                    : pos.includes("bottom-6 left")
                      ? "0 0 0 4px"
                      : "0 0 4px 0",
              }}
            />
          ))}

        {/* Premium timestamp overlay */}
        <div
          className="absolute bottom-5 left-4"
          style={{
            background: "oklch(0 0 0 / 0.55)",
            backdropFilter: "blur(16px)",
            border: "1px solid oklch(1 0 0 / 0.18)",
            borderRadius: 12,
            padding: "8px 14px",
          }}
        >
          <p className="font-mono font-bold text-white text-sm tracking-wider">
            {timeStr}
          </p>
          <p className="font-mono text-white/65 text-xs">{dateStr}</p>
        </div>

        {/* Error */}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 text-white p-6 text-center z-20">
            <AlertCircle className="w-12 h-12 text-red-400 mb-3" />
            <p className="font-semibold">
              {error.type === "permission"
                ? "Camera Permission Denied"
                : "Camera Error"}
            </p>
            <p className="text-sm text-white/60 mt-1">{error.message}</p>
            <button
              type="button"
              className="mt-4 px-6 py-2 rounded-xl text-white border border-white/30 hover:bg-white/10 transition-all"
              onClick={() => startCamera()}
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading */}
        {isLoading && !previewUrl && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-10 h-10 text-blue-300 animate-spin" />
              <p className="text-white/60 text-sm">Starting camera...</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div
        className="px-6 py-8 flex items-center justify-center gap-8"
        style={{ background: "oklch(0.06 0.04 265)" }}
      >
        {!previewUrl ? (
          <>
            <button
              type="button"
              onClick={() => switchCamera()}
              disabled={isLoading || !isActive}
              className="w-12 h-12 rounded-full text-white disabled:opacity-40 transition-all hover:scale-110 flex items-center justify-center"
              style={{ background: "oklch(1 0 0 / 0.10)" }}
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            {/* Shutter button with ring animation */}
            <div className="relative">
              <button
                type="button"
                data-ocid="teacher.camera_capture_button"
                onClick={handleCapture}
                disabled={!isActive || isLoading}
                className="relative w-20 h-20 rounded-full flex items-center justify-center disabled:opacity-40 transition-all active:scale-90"
                style={{
                  background: "oklch(1 0 0 / 0.20)",
                  border: "4px solid white",
                  boxShadow:
                    "0 0 0 2px oklch(0.56 0.18 240 / 0.5), 0 8px 32px oklch(0 0 0 / 0.4)",
                }}
              >
                <Camera className="w-8 h-8 text-white" />
              </button>
            </div>

            <div className="w-12 h-12" />
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={handleRetake}
              disabled={uploading}
              className="flex items-center gap-2 px-6 h-12 rounded-full text-white font-semibold text-sm disabled:opacity-40 transition-all"
              style={{
                background: "oklch(1 0 0 / 0.12)",
                border: "1px solid oklch(1 0 0 / 0.25)",
              }}
            >
              <RotateCcw className="w-4 h-4" /> Retake
            </button>

            <button
              type="button"
              data-ocid="teacher.camera_confirm_button"
              onClick={handleConfirm}
              disabled={uploading}
              className="btn-gradient flex items-center gap-2 px-8 h-12 rounded-full text-white font-semibold text-sm disabled:opacity-60 transition-all"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Uploading...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" /> Use Photo
                </>
              )}
            </button>
          </>
        )}
      </div>

      {uploadError && (
        <div
          className="text-center text-sm px-4 py-2"
          style={{
            background: "oklch(0.55 0.22 25 / 0.20)",
            color: "oklch(0.80 0.12 25)",
          }}
        >
          {uploadError}
        </div>
      )}

      {!previewUrl && !error && (
        <div
          className="text-center pb-5"
          style={{ background: "oklch(0.06 0.04 265)" }}
        >
          <div className="flex items-center justify-center gap-2 text-white/50 text-sm">
            <Droplets className="w-4 h-4 text-blue-400" />
            <span>தரமான புகைப்படம் எடுக்கவும்</span>
          </div>
          <p className="text-white/30 text-xs mt-0.5">
            Take a clear class photo
          </p>
        </div>
      )}
    </div>
  );
}
