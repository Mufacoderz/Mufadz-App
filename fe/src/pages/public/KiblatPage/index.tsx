import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation, MapPin, Compass, X } from "lucide-react";

const KAABA = { lat: 21.4225, lon: 39.8262 };
const JAKARTA = { lat: -6.2088, lon: 106.8456 };

function toRad(d: number) { return d * Math.PI / 180; }
function toDeg(r: number) { return r * 180 / Math.PI; }

function computeBearing(lat1: number, lon1: number, lat2: number, lon2: number) {
    const φ1 = toRad(lat1), φ2 = toRad(lat2), Δλ = toRad(lon2 - lon1);
    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

function computeDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371;
    const φ1 = toRad(lat1), φ2 = toRad(lat2);
    const Δφ = toRad(lat2 - lat1), Δλ = toRad(lon2 - lon1);
    const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

type Screen = "gate" | "dial";

const dialSize = "min(80vw, 336px)";

export default function KiblatPage() {
    const navigate = useNavigate();
    const [screen, setScreen] = useState<Screen>("gate");
    const [heading, setHeading] = useState(0);
    const [bearing, setBearing] = useState(0);
    const [distanceKm, setDistanceKm] = useState(0);
    const [aligned, setAligned] = useState(false);
    const [usingRealSensor, setUsingRealSensor] = useState(false);
    const [accuracy, setAccuracy] = useState<number | null>(null);
    const [lastLoc, setLastLoc] = useState<{ lat: number; lon: number } | null>(null);
    const [sweeping, setSweeping] = useState(false);
    const [previewMode, setPreviewMode] = useState(false);
    const [showToast, setShowToast] = useState<string | null>(null);

    const sweepRef = useRef<number>(0);
    const headingRef = useRef(0);
    const sensorWatchdogRef = useRef<ReturnType<typeof setTimeout>>();

    const cardinals: Record<number, string> = { 0: "U", 90: "T", 180: "S", 270: "B" };

    const ticks = useMemo(() => {
        const items: { deg: number; major: boolean }[] = [];
        for (let deg = 0; deg < 360; deg += 5) {
            items.push({ deg, major: deg % 30 === 0 });
        }
        return items;
    }, []);

    const labels = useMemo(() => {
        const items: { deg: number; isCardinal: boolean; text: string }[] = [];
        for (let deg = 0; deg < 360; deg += 30) {
            const isCardinal = cardinals[deg] !== undefined;
            items.push({ deg, isCardinal, text: isCardinal ? cardinals[deg] : String(deg) });
        }
        return items;
    }, []);

    const updateCompass = useCallback((h: number, b: number, d: number) => {
        const diff = Math.abs(((b - h + 540) % 360) - 180);
        const isAligned = diff <= 6;
        setHeading(h);
        setBearing(b);
        setDistanceKm(d);
        setAligned(isAligned);
        if (isAligned) {
            if (navigator.vibrate) navigator.vibrate(40);
        }
    }, []);

    const computeAndShow = useCallback((lat: number, lon: number, cb?: () => void) => {
        const b = computeBearing(lat, lon, KAABA.lat, KAABA.lon);
        const d = computeDistance(lat, lon, KAABA.lat, KAABA.lon);
        setBearing(b);
        setDistanceKm(d);
        updateCompass(headingRef.current, b, d);
        cb?.();
    }, [updateCompass]);

    const stopSweep = useCallback(() => {
        setSweeping(false);
        clearInterval(sweepRef.current);
    }, []);

    const startSweep = useCallback(() => {
        setSweeping(true);
        let dir = 1;
        let h = headingRef.current;
        sweepRef.current = window.setInterval(() => {
            h += dir * 1.1;
            if (h >= 359) { h = 359; dir = -1; }
            if (h <= 0) { h = 0; dir = 1; }
            headingRef.current = h;
            setHeading(h);
            updateCompass(h, bearing, distanceKm);
        }, 30);
    }, [bearing, distanceKm, updateCompass]);

    const handleOrientation = useCallback((e: DeviceOrientationEvent) => {
        let h: number | null = null;
        const we = e as DeviceOrientationEvent & { webkitCompassHeading?: number; webkitCompassAccuracy?: number };
        if (typeof we.webkitCompassHeading === "number") {
            h = we.webkitCompassHeading;
            setAccuracy(we.webkitCompassAccuracy ?? null);
        } else if (e.alpha !== null) {
            h = (360 - e.alpha) % 360;
            setAccuracy(null);
        } else {
            return;
        }
        setUsingRealSensor(true);
        setPreviewMode(false);
        clearTimeout(sensorWatchdogRef.current);
        stopSweep();
        headingRef.current = (h + 360) % 360;
        updateCompass(headingRef.current, bearing, distanceKm);
    }, [bearing, distanceKm, stopSweep, updateCompass]);

    const requestOrientation = useCallback(() => {
        const deo = DeviceOrientationEvent as unknown as (typeof DeviceOrientationEvent) & { requestPermission?: () => Promise<string> };
        if (typeof deo.requestPermission === "function") {
            deo.requestPermission().then((state) => {
                if (state === "granted") {
                    window.addEventListener("deviceorientation", handleOrientation);
                }
                setTimeout(() => {
                    if (!usingRealSensor) startDemo();
                }, 2500);
            }).catch(() => setTimeout(startDemo, 0));
        } else if ("DeviceOrientationEvent" in window) {
            window.addEventListener("deviceorientation", handleOrientation);
            setTimeout(() => {
                if (!usingRealSensor) startDemo();
            }, 2500);
        } else {
            setTimeout(startDemo, 0);
        }
    }, [handleOrientation, usingRealSensor]);

    const startDemo = useCallback(() => {
        const loc = lastLoc || JAKARTA;
        computeAndShow(loc.lat, loc.lon);
        setPreviewMode(true);
        setAccuracy(null);
        startSweep();
    }, [lastLoc, computeAndShow, startSweep]);

    useEffect(() => {
        return () => {
            clearInterval(sweepRef.current);
            clearTimeout(sensorWatchdogRef.current);
            window.removeEventListener("deviceorientation", handleOrientation);
        };
    }, [handleOrientation]);

    useEffect(() => {
        if (showToast) {
            const t = setTimeout(() => setShowToast(null), 3400);
            return () => clearTimeout(t);
        }
    }, [showToast]);

    const activateCompass = () => {
        setScreen("dial");
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const loc = { lat: pos.coords.latitude, lon: pos.coords.longitude };
                    setLastLoc(loc);
                    computeAndShow(loc.lat, loc.lon);
                    requestOrientation();
                },
                () => {
                    computeAndShow(JAKARTA.lat, JAKARTA.lon);
                    requestOrientation();
                },
                { timeout: 6000 }
            );
        } else {
            computeAndShow(JAKARTA.lat, JAKARTA.lon);
            requestOrientation();
        }
    };

    const showPreview = () => {
        setScreen("dial");
        setLastLoc(JAKARTA);
        computeAndShow(JAKARTA.lat, JAKARTA.lon);
        startDemo();
    };

    const diff = Math.abs(((bearing - heading + 540) % 360) - 180);

    const accuracyLabel = accuracy == null
        ? "Kalibrasi tak terdeteksi"
        : accuracy <= 10
            ? "Akurat"
            : accuracy <= 25
                ? "Cukup akurat"
                : "Kurang akurat, kalibrasi ulang";

    const accuracyClass = accuracy == null
        ? "text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20"
        : accuracy <= 10
            ? "text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20"
            : "text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20";

    return (
        <div className="w-full dark:bg-gray-900 min-h-dvh flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {showToast && (
                <div className="fixed left-1/2 bottom-6 z-50 -translate-x-1/2 bg-white dark:bg-gray-800 border border-blue-100 dark:border-gray-700 text-textLight dark:text-textDark text-xs px-4 py-2.5 rounded-xl shadow-lg text-center max-w-[280px] transition-all duration-300">
                    {showToast}
                </div>
            )}

            {/* Gate */}
            {screen === "gate" && (
                <div className="flex flex-col items-center text-center gap-4 max-w-xs">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 mb-1">
                        <Compass className="w-7 h-7 text-textLight dark:text-textDark" />
                    </div>
                    <h1 className="text-xl font-bold text-textLight dark:text-textDark leading-snug">
                        Temukan arah kiblat<br />dari lokasimu
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                        Butuh akses lokasi dan sensor arah perangkat supaya arahnya akurat.
                    </p>
                    <div className="flex flex-col gap-2 w-full mt-2">
                        <button
                            onClick={activateCompass}
                            className="relative overflow-hidden rounded-full bg-gradient-to-r from-indigo-600 via-blue-500 to-sky-400 dark:from-sky-400 dark:via-blue-500 dark:to-indigo-600 text-white dark:text-gray-800 font-semibold px-5 py-2.5 shadow-lg shadow-blue-300/40 dark:shadow-blue-700/40 transition-all duration-300 ease-out hover:scale-105 hover:shadow-blue-400/50 focus:outline-none w-full group"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                <Navigation size={16} />
                                Aktifkan Kompas &amp; Lokasi
                            </span>
                            <span className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] animate-[shine_2.5s_infinite]" />
                        </button>
                        <button
                            onClick={showPreview}
                            className="rounded-full border border-blue-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 font-semibold px-5 py-2.5 hover:border-textLight dark:hover:border-textDark hover:text-textLight dark:hover:text-textDark transition-all duration-300 w-full"
                        >
                            Lihat pratinjau
                        </button>
                    </div>
                </div>
            )}

            {/* Dial */}
            {screen === "dial" && (
                <div className="flex flex-col items-center gap-5 w-full max-w-xs">
                    <div className="flex items-center justify-between w-full">
                        <span className="text-[10px] font-bold tracking-widest text-textLight dark:text-textDark uppercase">
                            Mufadz · Kompas Kiblat
                        </span>
                        <button onClick={() => navigate("/")} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <X size={16} className="text-gray-400 dark:text-gray-500" />
                        </button>
                    </div>

                    {/* Accuracy badge */}
                    {!previewMode && (
                        <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1 rounded-full border transition-colors ${accuracyClass}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            {accuracyLabel}
                        </span>
                    )}
                    {previewMode && (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1 rounded-full border text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            Mode pratinjau
                        </span>
                    )}

                    {/* Dial */}
                    <div
                        className={`relative rounded-full transition-shadow duration-500 ${aligned ? "shadow-[0_0_46px_8px_rgba(52,211,153,0.35)]" : ""}`}
                        style={{ width: dialSize, height: dialSize }}
                    >
                        <div
                            className={`absolute inset-0 rounded-full bg-gradient-to-b from-blue-50 to-white dark:from-gray-800 dark:to-gray-950 shadow-[0_0_0_1px_rgba(59,130,246,0.2),inset_0_0_34px_rgba(0,0,0,0.08),0_18px_40px_-14px_rgba(0,0,0,0.4)] dark:shadow-[0_0_0_1px_rgba(125,211,252,0.15),inset_0_0_34px_rgba(0,0,0,0.55),0_18px_40px_-14px_rgba(0,0,0,0.7)] transition-shadow duration-500 ${aligned ? "!shadow-[0_0_0_2px_rgb(52,211,153),0_0_46px_8px_rgba(52,211,153,0.35),inset_0_0_30px_rgba(52,211,153,0.12)]" : ""}`}
                        />

                        {/* Lubber line */}
                        <div className="absolute top-[-9px] left-1/2 -translate-x-1/2 z-10 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[14px] border-t-textLight dark:border-t-textDark drop-shadow-[0_2px_6px_rgba(59,130,246,0.4)] dark:drop-shadow-[0_2px_6px_rgba(125,211,252,0.4)]" />

                        {/* Rose */}
                        <div
                            className="absolute inset-0 rounded-full transition-transform duration-[120ms] linear"
                            style={{ transform: `rotate(${-heading}deg)` }}
                        >
                            {/* Ticks */}
                            {ticks.map((t) => (
                                <div
                                    key={t.deg}
                                    className="absolute inset-0"
                                    style={{ transform: `rotate(${t.deg}deg)` }}
                                >
                                    <div
                                        className={`absolute top-2 left-1/2 -translate-x-1/2 ${t.major ? "w-[2.5px] h-[15px] bg-textLight/60 dark:bg-textDark/60" : "w-[1.5px] h-[9px] bg-textLight/30 dark:bg-textDark/30"}`}
                                    />
                                </div>
                            ))}

                            {/* Labels */}
                            {labels.map((l) => (
                                <div
                                    key={l.deg}
                                    className="absolute inset-0"
                                    style={{ transform: `rotate(${l.deg}deg)` }}
                                >
                                    <span
                                        className={`absolute top-[27px] left-1/2 -translate-x-1/2 text-[11px] font-bold ${l.isCardinal ? "text-[16px] font-extrabold text-textLight dark:text-textDark" : "text-gray-400 dark:text-gray-500"}`}
                                    >
                                        {l.text}
                                    </span>
                                </div>
                            ))}

                            {/* Kaaba */}
                            <div
                                className="absolute inset-0"
                                style={{ transform: `rotate(${bearing}deg)` }}
                            >
                                <div className="absolute top-3 left-1/2 -translate-x-1/2">
                                    <div
                                        className="w-[30px] h-[30px] rounded-[9px] flex items-center justify-center shadow-[0_0_0_3px_white,0_4px_14px_-2px_rgba(59,130,246,0.5)] dark:shadow-[0_0_0_3px_#111827,0_4px_14px_-2px_rgba(125,211,252,0.5)] bg-gradient-to-b from-textLight to-blue-700 dark:from-textDark dark:to-blue-500"
                                        style={{ transform: `rotate(${heading - bearing}deg)` }}
                                    >
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="dark:stroke-gray-900">
                                            <rect x="4" y="6" width="16" height="14" rx="1.2" />
                                            <path d="M4 6l8-3 8 3" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Center cap */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[10px] h-[10px] rounded-full bg-gradient-to-b from-textLight to-blue-700 dark:from-textDark dark:to-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] dark:shadow-[0_0_8px_rgba(125,211,252,0.5)] z-10" />
                    </div>

                    {/* Readout */}
                    <div className="text-center transition-colors duration-300">
                        <p className={`text-sm font-bold transition-colors ${aligned ? "text-emerald-500 dark:text-emerald-400" : "text-textLight dark:text-textDark"}`}>
                            {aligned ? "Menghadap Kiblat" : "Arahkan HP untuk menemukan kiblat"}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-1">
                            Arah {Math.round(bearing)}° · {distanceKm.toLocaleString("id-ID", { maximumFractionDigits: 0 })} km ke Ka'bah
                        </p>
                    </div>

                    {/* Demo controls */}
                    {previewMode && (
                        <div className="w-full max-w-[260px] flex flex-col items-center gap-2 p-3 border border-dashed border-blue-200 dark:border-blue-800 rounded-2xl bg-blue-50/50 dark:bg-blue-900/10">
                            <span className="text-[10px] font-bold tracking-wider text-textLight dark:text-textDark uppercase">
                                Mode pratinjau — geser untuk uji manual
                            </span>
                            <input
                                type="range"
                                min={0}
                                max={359}
                                value={Math.round(heading)}
                                onChange={(e) => {
                                    stopSweep();
                                    const h = Number(e.target.value);
                                    headingRef.current = h;
                                    setHeading(h);
                                    updateCompass(h, bearing, distanceKm);
                                }}
                                className="w-full accent-textLight dark:accent-textDark"
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={() => { if (sweeping) stopSweep(); else startSweep(); }}
                                    className="text-[11px] font-semibold px-3 py-1.5 rounded-full border border-blue-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-textLight dark:hover:border-textDark hover:text-textLight dark:hover:text-textDark transition-all"
                                >
                                    {sweeping ? "Jeda animasi" : "Lanjutkan animasi"}
                                </button>
                                <button
                                    onClick={() => setShowToast("Gerakkan HP membentuk pola angka 8 beberapa kali, lalu coba lagi.")}
                                    className="text-[11px] font-semibold px-3 py-1.5 rounded-full border border-blue-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-textLight dark:hover:border-textDark hover:text-textLight dark:hover:text-textDark transition-all"
                                >
                                    Kalibrasi ulang
                                </button>
                            </div>
                        </div>
                    )}

                    {!previewMode && (
                        <button
                            onClick={() => setShowToast("Gerakkan HP membentuk pola angka 8 beberapa kali, lalu coba lagi.")}
                            className="text-[11px] font-semibold px-3 py-1.5 rounded-full border border-blue-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-textLight dark:hover:border-textDark hover:text-textLight dark:hover:text-textDark transition-all"
                        >
                            Kalibrasi ulang
                        </button>
                    )}

                    <p className="text-[10px] text-gray-400 dark:text-gray-600 text-center max-w-[260px] leading-relaxed">
                        Akurasi tergantung sensor perangkat. Jauhkan dari benda logam atau magnet untuk hasil terbaik.
                    </p>
                </div>
            )}
        </div>
    );
}
