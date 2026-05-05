import React from "react";

const STATUS_MAP = {
    live: { label: "Live", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" },
    stopped: { label: "Stopped", color: "bg-rose-500/20 text-rose-300 border-rose-500/40" },
    loading: { label: "Loading", color: "bg-amber-500/20 text-amber-300 border-amber-500/40" },
    error: { label: "Error", color: "bg-red-500/20 text-red-300 border-red-500/40" }
};

export default function StatusBadge({ status, message }) {
    const config = STATUS_MAP[status] || STATUS_MAP.stopped;

    return (
        <div className="flex flex-col items-end gap-1">
            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${config.color}`}>
                {status === "live" ? "🟢" : status === "stopped" ? "🔴" : status === "loading" ? "🟡" : "⚠️"} {config.label}
            </span>
            {message && <span className="text-xs text-red-200/80">{message}</span>}
        </div>
    );
}
