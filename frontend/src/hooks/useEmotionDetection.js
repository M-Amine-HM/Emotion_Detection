import { useCallback, useEffect, useRef, useState } from "react";

const API_URL = "http://localhost:8000/predict";
const CAPTURE_INTERVAL = 500;
const EMIT_DEBOUNCE_MS = 120;
const FPS_WINDOW_MS = 3000;

export default function useEmotionDetection({ videoRef, canvasRef }) {
    const [isRunning, setIsRunning] = useState(false);
    const [emotions, setEmotions] = useState([]);
    const [dominant, setDominant] = useState("");
    const [error, setError] = useState("");
    const [fps, setFps] = useState(0);
    const [status, setStatus] = useState("stopped");

    const inFlightRef = useRef(false);
    const timestampsRef = useRef([]);
    const pendingRef = useRef(null);
    const debounceTimerRef = useRef(null);
    const mountedRef = useRef(true);

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, []);

    const updateFps = useCallback(() => {
        const now = Date.now();
        const windowStart = now - FPS_WINDOW_MS;
        timestampsRef.current = timestampsRef.current.filter((t) => t >= windowStart);
        const nextFps = timestampsRef.current.length / (FPS_WINDOW_MS / 1000);
        setFps(nextFps);
    }, []);

    const emitUpdate = useCallback(
        (nextPayload) => {
            pendingRef.current = nextPayload;
            if (debounceTimerRef.current) {
                return;
            }

            debounceTimerRef.current = setTimeout(() => {
                const payload = pendingRef.current;
                pendingRef.current = null;
                debounceTimerRef.current = null;

                if (!payload || !mountedRef.current) {
                    return;
                }

                setEmotions(payload.emotions);
                setDominant(payload.dominant);
                updateFps();
            }, EMIT_DEBOUNCE_MS);
        },
        [updateFps]
    );

    const sendImage = useCallback(async (base64) => {
        if (inFlightRef.current) {
            return;
        }

        inFlightRef.current = true;

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ image: base64 })
            });

            if (!response.ok) {
                const detail = await response.json().catch(() => ({}));
                const message = detail?.detail || `Server error: ${response.status}`;
                throw new Error(message);
            }

            const data = await response.json();
            const nextEmotions = Array.isArray(data?.emotions)
                ? data.emotions
                : Array.isArray(data)
                    ? data
                    : [];
            const nextDominant = data?.dominant || nextEmotions[0]?.label || "";
            timestampsRef.current.push(Date.now());
            emitUpdate({ emotions: nextEmotions, dominant: nextDominant });
            if (mountedRef.current) {
                setError("");
                setStatus("live");
            }
        } catch (err) {
            if (mountedRef.current) {
                setError(err.message || "Backend unreachable");
                setStatus("error");
            }
        } finally {
            inFlightRef.current = false;
        }
    }, [emitUpdate]);

    const captureAndPredict = useCallback(async () => {
        if (inFlightRef.current) {
            return;
        }

        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas || video.readyState < 2) {
            return;
        }

        const ctx = canvas.getContext("2d");
        if (!ctx) {
            return;
        }

        try {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
            const base64 = dataUrl.split(",")[1] || "";
            await sendImage(base64);
        } catch (err) {
            if (mountedRef.current) {
                setError(err.message || "Backend unreachable");
                setStatus("error");
            }
        }
    }, [canvasRef, sendImage, videoRef]);

    useEffect(() => {
        if (!isRunning) {
            return undefined;
        }

        setStatus("loading");
        const intervalId = setInterval(captureAndPredict, CAPTURE_INTERVAL);

        return () => {
            clearInterval(intervalId);
        };
    }, [captureAndPredict, isRunning]);

    const startDetection = useCallback(() => {
        setIsRunning(true);
        setError("");
        setStatus("loading");
    }, []);

    const stopDetection = useCallback(() => {
        setIsRunning(false);
        setStatus("stopped");
    }, []);

    const predictImageFile = useCallback(async (file) => {
        if (!file) {
            return;
        }

        setStatus("loading");
        const base64 = await readFileAsBase64(file);
        await sendImage(base64);
    }, [sendImage]);

    return {
        isRunning,
        emotions,
        dominant,
        error,
        fps,
        status,
        startDetection,
        stopDetection,
        predictImageFile
    };
}

function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = typeof reader.result === "string" ? reader.result : "";
            const base64 = result.split(",")[1] || "";
            resolve(base64);
        };
        reader.onerror = () => reject(reader.error || new Error("Failed to read file"));
        reader.readAsDataURL(file);
    });
}
