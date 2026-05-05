import React from "react";

export default function EmotionBar({ label, score, color, emoji }) {
    const percent = Math.round(score * 100);

    return (
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                    <span>{emoji}</span>
                    <span className="capitalize text-white/80">{label}</span>
                </div>
                <span className="text-white/60">{percent}%</span>
            </div>
            <div className="mt-2 h-2 w-full rounded-full bg-white/10">
                <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percent}%`, backgroundColor: color }}
                />
            </div>
        </div>
    );
}
