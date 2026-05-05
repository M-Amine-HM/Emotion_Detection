import React, { useCallback, useEffect, useState } from "react";

export default function WebcamFeed({
    videoRef,
    canvasRef,
    isRunning,
    onStart,
    onStop,
    previewUrl,
    isPreview
}) {
    const [permissionError, setPermissionError] = useState("");

    const initCamera = useCallback(async () => {
        setPermissionError("");

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }
        } catch (err) {
            setPermissionError("Webcam access denied. Please allow camera permissions and retry.");
        }
    }, [videoRef]);

    useEffect(() => {
        if (isPreview) {
            if (videoRef.current && videoRef.current.srcObject) {
                const tracks = videoRef.current.srcObject.getTracks();
                tracks.forEach((track) => track.stop());
                videoRef.current.srcObject = null;
            }
            return undefined;
        }

        initCamera();

        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const tracks = videoRef.current.srcObject.getTracks();
                tracks.forEach((track) => track.stop());
            }
        };
    }, [initCamera, isPreview, videoRef]);

    return (
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40">
            {previewUrl ? (
                <img
                    src={previewUrl}
                    alt="Uploaded preview"
                    className="aspect-video w-full object-cover"
                />
            ) : (
                <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="aspect-video w-full object-cover"
                />
            )}
            <canvas ref={canvasRef} width={640} height={480} className="hidden" />

            <div className="pointer-events-none absolute inset-8 rounded-2xl border-2 border-accent/60" />

            {permissionError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 p-6 text-center">
                    <p className="text-sm text-white/80">{permissionError}</p>
                    <button
                        onClick={initCamera}
                        className="mt-4 rounded-full border border-accent/60 px-4 py-2 text-sm text-white transition hover:border-accent hover:text-white"
                    >
                        Retry Camera
                    </button>
                </div>
            )}

            <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3">
                <button
                    onClick={isPreview ? undefined : isRunning ? onStop : onStart}
                    disabled={isPreview}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${isRunning
                        ? "border border-white/20 bg-white/10 text-white hover:bg-white/20"
                        : "border border-accent/60 bg-accent/20 text-white hover:bg-accent/30"
                        } ${isPreview ? "cursor-not-allowed opacity-60" : ""}`}
                >
                    {isPreview ? "Upload Mode" : isRunning ? "Stop Detection" : "Start Detection"}
                </button>
                <span className="text-xs text-white/60">Live feed active</span>
            </div>
        </div>
    );
}
