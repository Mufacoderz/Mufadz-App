import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Compass } from "lucide-react";

const STORAGE_KEY = "kiblat:fabPosition";

interface Pos {
    x: number;
    y: number;
}

function loadPos(): Pos {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw);
    } catch { }
    return { x: 16, y: 16 };
}

function savePos(pos: Pos) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pos));
}

export default function KiblatFAB() {
    const navigate = useNavigate();
    const [pos, setPos] = useState<Pos>(loadPos);
    const dragging = useRef(false);
    const offset = useRef({ x: 0, y: 0 });
    const fabRef = useRef<HTMLButtonElement>(null);

    const [hidden, setHidden] = useState(false);

    useEffect(() => {
        savePos(pos);
    }, [pos]);

    const handlePointerDown = useCallback((e: React.PointerEvent) => {
        dragging.current = true;
        const rect = fabRef.current?.getBoundingClientRect();
        if (rect) {
            offset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        }
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }, []);

    const handlePointerMove = useCallback((e: React.PointerEvent) => {
        if (!dragging.current) return;
        e.preventDefault();
        const x = e.clientX - offset.current.x;
        const y = e.clientY - offset.current.y;
        setPos({ x: Math.max(0, x), y: Math.max(0, y) });
    }, []);

    const handlePointerUp = useCallback(() => {
        if (!dragging.current) return;
        dragging.current = false;
        setPos((prev) => {
            const snapMargin = 16;
            const edge = prev.x < window.innerWidth / 2 ? snapMargin : window.innerWidth - 56 - snapMargin;
            const clamped = { x: edge, y: Math.max(16, Math.min(prev.y, window.innerHeight - 72)) };
            savePos(clamped);
            return clamped;
        });
    }, []);

    const hiddenPaths = ["/login", "/register", "/kiblat"];

    return (
        <button
            ref={fabRef}
            onClick={() => { if (!dragging.current) navigate("/kiblat"); }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="fixed z-40 w-14 h-14 rounded-full bg-gradient-to-r from-indigo-600 via-blue-500 to-sky-400 dark:from-sky-400 dark:via-blue-500 dark:to-indigo-600 text-white dark:text-gray-800 shadow-lg shadow-blue-300/40 dark:shadow-blue-700/40 hover:scale-105 transition-all duration-200 ease-out flex items-center justify-center cursor-grab active:cursor-grabbing touch-none select-none"
            style={{
                left: pos.x,
                top: pos.y,
            }}
        >
            <Compass size={22} />
        </button>
    );
}
