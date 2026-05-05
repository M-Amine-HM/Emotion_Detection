import React, { useMemo } from "react";
import EmotionBar from "./EmotionBar.jsx";

export default function EmotionDisplay({ emotions, dominant, emojiMap, colorMap }) {
    const dominantScore = useMemo(() => {
        const top = emotions[0];
        return top ? Math.round(top.score * 100) : 0;
    }, [emotions]);

    const dominantLabel = dominant || (emotions[0] ? emotions[0].label : "waiting");
    const dominantEmoji = emojiMap[dominantLabel] || "🤔";

    return (
        <div className="flex h-full flex-col">
            <div className="flex items-center gap-6 rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="text-5xl">{dominantEmoji}</div>
                <div>
                    <h2 className="text-2xl font-semibold capitalize">{dominantLabel}</h2>
                    <p className="text-sm text-white/60">{dominantScore}% confidence</p>
                </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
                <h3 className="text-lg font-semibold">All Emotions</h3>
                <span className="text-xs text-white/50">Updated live</span>
            </div>

            <div className="mt-4 flex flex-col gap-3">
                {emotions.length === 0 && (
                    <div className="rounded-xl border border-dashed border-white/10 p-6 text-sm text-white/60">
                        Waiting for predictions...
                    </div>
                )}

                {emotions.map((emotion) => (
                    <EmotionBar
                        key={emotion.label}
                        label={emotion.label}
                        score={emotion.score}
                        color={colorMap[emotion.label] || "#2B97C7"}
                        emoji={emojiMap[emotion.label] || "✨"}
                    />
                ))}
            </div>
        </div>
    );
}
