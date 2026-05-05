import React, { useMemo, useRef, useState, useEffect } from "react";
import WebcamFeed from "./components/WebcamFeed.jsx";
import EmotionDisplay from "./components/EmotionDisplay.jsx";
import StatusBadge from "./components/StatusBadge.jsx";
import useEmotionDetection from "./hooks/useEmotionDetection.js";

const EMOJI_MAP = {
    happy: "😊",
    sad: "😢",
    angry: "😠",
    fear: "😨",
    surprise: "😲",
    disgust: "🤢",
    neutral: "😐",
    contempt: "😒"
};

const COLOR_MAP = {
    happy: "#FFD700",
    sad: "#4A90D9",
    angry: "#E74C3C",
    fear: "#9B59B6",
    surprise: "#F39C12",
    disgust: "#27AE60",
    neutral: "#95A5A6",
    contempt: "#E67E22"
};

export default function App() {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [mode, setMode] = useState("live");
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");

    const {
        isRunning,
        emotions,
        dominant,
        error,
        fps,
        status,
        startDetection,
        stopDetection,
        predictImageFile
    } = useEmotionDetection({ videoRef, canvasRef });

    const stats = useMemo(() => {
        return {
            fps: fps.toFixed(1)
        };
    }, [fps]);

    useEffect(() => {
        if (!selectedFile) {
            setPreviewUrl("");
            return undefined;
        }

        const nextUrl = URL.createObjectURL(selectedFile);
        setPreviewUrl(nextUrl);
        return () => {
            URL.revokeObjectURL(nextUrl);
        };
    }, [selectedFile]);

    return (
        <div className="min-h-screen px-6 py-10 md:px-12">
            <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                    <span className="text-3xl">🎭</span>
                    <div>
                        <h1 className="text-3xl font-semibold tracking-tight">Emotion Detection</h1>
                        <p className="text-sm text-white/60">Real-time facial emotion inference</p>
                    </div>
                </div>
                <a
                    className="inline-flex items-center gap-2 text-sm text-white/70 transition hover:text-white"
                    href="https://github.com"
                    target="_blank"
                    rel="noreferrer"
                >
                    <span className="text-lg">🔗</span>
                    GitHub
                </a>
            </header>

            <main className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
                <section className="rounded-3xl border border-white/10 bg-panel/80 p-6 shadow-glow backdrop-blur">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Live Webcam</h2>
                        <StatusBadge status={status} message={error} />
                    </div>

                    <div className="mt-5">
                        <WebcamFeed
                            videoRef={videoRef}
                            canvasRef={canvasRef}
                            isRunning={isRunning}
                            onStart={startDetection}
                            onStop={stopDetection}
                            previewUrl={previewUrl}
                            isPreview={mode === "upload" && Boolean(previewUrl)}
                        />
                    </div>

                    <div className="mt-5 flex flex-wrap items-center gap-3">
                        <button
                            onClick={() => {
                                setMode("live");
                                setSelectedFile(null);
                            }}
                            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${mode === "live"
                                ? "border border-accent/60 bg-accent/20 text-white"
                                : "border border-white/10 text-white/70 hover:text-white"
                                }`}
                        >
                            Live Detection
                        </button>
                        <button
                            onClick={() => {
                                stopDetection();
                                setMode("upload");
                            }}
                            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${mode === "upload"
                                ? "border border-accent/60 bg-accent/20 text-white"
                                : "border border-white/10 text-white/70 hover:text-white"
                                }`}
                        >
                            Upload Image
                        </button>
                    </div>

                    {mode === "upload" && (
                        <div className="mt-4 flex flex-wrap items-center gap-3">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(event) => {
                                    const file = event.target.files?.[0] || null;
                                    setSelectedFile(file);
                                }}
                                className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70 file:mr-3 file:rounded-full file:border-0 file:bg-white/10 file:px-3 file:py-1 file:text-xs file:text-white"
                            />
                            <button
                                onClick={() => {
                                    if (selectedFile) {
                                        predictImageFile(selectedFile);
                                    }
                                }}
                                className="rounded-full border border-accent/60 bg-accent/20 px-4 py-2 text-xs font-semibold text-white transition hover:bg-accent/30"
                            >
                                Analyze Image
                            </button>
                        </div>
                    )}

                    <div className="mt-5 flex flex-wrap items-center justify-between gap-4 text-sm text-white/70">
                        <div className="flex items-center gap-3">
                            <span className="text-white/50">FPS</span>
                            <span className="text-base font-semibold text-white">{stats.fps}</span>
                        </div>
                        <div className="text-white/50">
                            {mode === "upload"
                                ? "Upload a still image for analysis"
                                : isRunning
                                    ? "Streaming every 500ms"
                                    : "Camera idle"}
                        </div>
                    </div>
                </section>

                <section className="rounded-3xl border border-white/10 bg-panel/80 p-6 shadow-glow backdrop-blur">
                    <EmotionDisplay
                        emotions={emotions}
                        dominant={dominant}
                        emojiMap={EMOJI_MAP}
                        colorMap={COLOR_MAP}
                    />
                </section>
            </main>

            <footer className="mt-10 text-sm text-white/50">
                Powered by dima806/facial_emotions_image_detection
            </footer>
        </div>
    );
}
