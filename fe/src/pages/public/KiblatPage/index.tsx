import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation, Compass, X, Smartphone, CheckCircle2, AlertTriangle } from "lucide-react";

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
type ResetStep = "idle" | "instruction" | "progress" | "success" | "fail";

const dialSize = "min(80vw, 336px)";
const CARDINALS: Record<number, string> = { 0: "U", 90: "T", 180: "S", 270: "B" };

// Berapa lama proses "setel ulang" berjalan sebelum dievaluasi hasilnya
const RESET_DURATION_MS = 5000;
// Total akumulasi perubahan sudut (derajat) selama proses berlangsung,
// dipakai sebagai bukti bahwa HP benar-benar digerakkan (bukan cuma didiemin)
const RESET_MOVE_THRESHOLD = 220;

export default function KiblatPage() {
    const navigate = useNavigate();
    const [screen, setScreen] = useState<Screen>("gate");
    const [heading, setHeading] = useState(0);
    const [bearing, setBearing] = useState(0);
    const [distanceKm, setDistanceKm] = useState(0);
    const [aligned, setAligned] = useState(false);
    const [usingRealSensor, setUsingRealSensor] = useState(false);
    const [accuracy, setAccuracy] = useState<number | null>(null);
    const [sensorError, setSensorError] = useState<string | null>(null);

    // Alur "Setel Ulang Arah"
    const [resetStep, setResetStep] = useState<ResetStep>("idle");
    const [resetProgressPct, setResetProgressPct] = useState(0);
    const [resetRotationDeg, setResetRotationDeg] = useState(0);

    const headingRef = useRef(0);
    const sensorWatchdogRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const resetTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const resetIntervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
    const resetCumulativeRef = useRef(0);
    const resetAccuracyStartRef = useRef<number | null>(null);
    const prevHeadingForResetRef = useRef<number | null>(null);

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
            const isCardinal = CARDINALS[deg] !== undefined;
            items.push({ deg, isCardinal, text: isCardinal ? CARDINALS[deg] : String(deg) });
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
        clearTimeout(sensorWatchdogRef.current);
        setSensorError(null);
        headingRef.current = (h + 360) % 360;
        updateCompass(headingRef.current, bearing, distanceKm);
    }, [bearing, distanceKm, updateCompass]);

    const requestOrientation = useCallback(() => {
        const deo = DeviceOrientationEvent as typeof DeviceOrientationEvent & {
            requestPermission?: () => Promise<string>;
        };

        const startListening = () => {
            window.addEventListener("deviceorientation", handleOrientation);

            sensorWatchdogRef.current = window.setTimeout(() => {
                if (!usingRealSensor) {
                    setSensorError(
                        "Sensor kompas tidak terdeteksi pada perangkat ini."
                    );
                }
            }, 2500);
        };

        if (typeof deo.requestPermission === "function") {
            deo.requestPermission()
                .then((state) => {
                    if (state === "granted") {
                        startListening();
                    } else {
                        setSensorError("Izin sensor arah ditolak.");
                    }
                })
                .catch(() => {
                    setSensorError("Tidak dapat mengakses sensor arah.");
                });
        } else if ("DeviceOrientationEvent" in window) {
            startListening();
        } else {
            setSensorError("Browser atau perangkat tidak mendukung kompas.");
        }
    }, [handleOrientation, usingRealSensor]);

    // Cleanup listener sensor arah
    useEffect(() => {
        return () => {
            clearTimeout(sensorWatchdogRef.current);
            window.removeEventListener("deviceorientation", handleOrientation);
        };
    }, [handleOrientation]);

    // Cleanup timer/interval punya alur "Setel Ulang Arah"
    useEffect(() => {
        return () => {
            clearTimeout(resetTimerRef.current);
            clearInterval(resetIntervalRef.current);
        };
    }, []);

    // Akumulasi total perubahan sudut selama proses "progress" berjalan,
    // ini bukti nyata bahwa HP digerakkan, dipakai buat nentuin sukses/gagal
    useEffect(() => {
        if (resetStep !== "progress") {
            prevHeadingForResetRef.current = null;
            return;
        }
        if (prevHeadingForResetRef.current !== null) {
            let delta = Math.abs(heading - prevHeadingForResetRef.current);
            if (delta > 180) delta = 360 - delta;
            resetCumulativeRef.current += delta;
        }
        prevHeadingForResetRef.current = heading;
    }, [heading, resetStep]);

    // Auto-close modal saat berhasil
    useEffect(() => {
        if (resetStep === "success") {
            const t = setTimeout(() => setResetStep("idle"), 1800);
            return () => clearTimeout(t);
        }
    }, [resetStep]);

    const activateCompass = () => {
        setScreen("dial");
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const loc = { lat: pos.coords.latitude, lon: pos.coords.longitude };
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

    // Buka modal "Setel Ulang Arah". Kalau sensor memang lagi error total,
    // langsung tampilkan status gagal dengan alasan yang sama persis dengan
    // kartu error di atas — biar gak ada dua sumber pesan yang beda.
    const openResetModal = () => {
        if (sensorError) {
            setResetStep("fail");
            return;
        }
        setResetStep("instruction");
    };

    const closeResetModal = () => {
        clearTimeout(resetTimerRef.current);
        clearInterval(resetIntervalRef.current);
        setResetStep("idle");
    };

    const beginReset = useCallback(() => {
        resetCumulativeRef.current = 0;
        prevHeadingForResetRef.current = null;
        resetAccuracyStartRef.current = accuracy;
        setResetRotationDeg(0);
        setResetProgressPct(0);
        setResetStep("progress");

        const startedAt = Date.now();
        clearInterval(resetIntervalRef.current);
        resetIntervalRef.current = setInterval(() => {
            const pct = Math.min(100, ((Date.now() - startedAt) / RESET_DURATION_MS) * 100);
            setResetProgressPct(pct);
            setResetRotationDeg(Math.round(resetCumulativeRef.current));
        }, 100);

        clearTimeout(resetTimerRef.current);
        resetTimerRef.current = setTimeout(() => {
            clearInterval(resetIntervalRef.current);
            const startAcc = resetAccuracyStartRef.current;
            const improvedAccuracy =
                accuracy !== null && accuracy <= 25 && (startAcc === null || accuracy < startAcc);
            const movedEnough = resetCumulativeRef.current >= RESET_MOVE_THRESHOLD;

            if (sensorError) {
                setResetStep("fail");
            } else if (improvedAccuracy || movedEnough) {
                if (navigator.vibrate) navigator.vibrate([30, 40, 30]);
                setResetStep("success");
            } else {
                setResetStep("fail");
            }
        }, RESET_DURATION_MS);
    }, [accuracy, sensorError]);

    const accuracyLabel = accuracy == null
        ? "Akurasi belum terdeteksi"
        : accuracy <= 10
            ? "Akurat"
            : accuracy <= 25
                ? "Cukup akurat"
                : "Kurang akurat, coba setel ulang";

    const accuracyClass = accuracy == null
        ? "text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20"
        : accuracy <= 10
            ? "text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20"
            : "text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20";

    return (
        <div className="w-full dark:bg-gray-900 min-h-dvh flex flex-col items-center justify-center p-4 relative overflow-hidden">
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
                    {!sensorError && (
                        <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1 rounded-full border transition-colors ${accuracyClass}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            {accuracyLabel}
                        </span>
                    )}

                    {sensorError && (
                        <div className="w-full rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4 text-center">
                            <p className="font-semibold text-red-600 dark:text-red-400">
                                Kompas tidak tersedia
                            </p>
                            <p className="text-sm mt-2 text-gray-600 dark:text-gray-300">
                                {sensorError}
                            </p>
                            <button
                                onClick={() => {
                                    setSensorError(null);
                                    requestOrientation();
                                }}
                                className="mt-4 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                            >
                                Coba Lagi
                            </button>
                        </div>
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

                    {/* Setel Ulang Arah */}
                    <button
                        onClick={openResetModal}
                        className="text-[11px] font-semibold px-3 py-1.5 rounded-full border border-blue-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-textLight dark:hover:border-textDark hover:text-textLight dark:hover:text-textDark transition-all"
                    >
                        Setel ulang arah
                    </button>

                    <p className="text-[10px] text-gray-400 dark:text-gray-600 text-center max-w-[260px] leading-relaxed">
                        Akurasi tergantung sensor perangkat. Jauhkan dari benda logam atau magnet untuk hasil terbaik.
                    </p>
                </div>
            )}

            {/* Modal Setel Ulang Arah */}
            {resetStep !== "idle" && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="animate-modal-pop relative w-full max-w-xs rounded-3xl bg-white dark:bg-gray-900 border border-blue-100 dark:border-gray-700 shadow-2xl p-6 flex flex-col items-center text-center gap-4">

                        {resetStep !== "progress" && (
                            <button
                                onClick={closeResetModal}
                                className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                <X size={16} className="text-gray-400 dark:text-gray-500" />
                            </button>
                        )}

                        {resetStep === "instruction" && (
                            <>
                                <div className="w-20 h-20 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                                    <Smartphone className="w-9 h-9 text-textLight dark:text-textDark animate-figure8" />
                                </div>
                                <h2 className="text-base font-bold text-textLight dark:text-textDark">
                                    Setel Ulang Arah
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                    Pegang HP mendatar, lalu gerakkan membentuk pola angka 8 beberapa kali supaya arah kiblat makin akurat.
                                </p>
                                <div className="flex gap-2 w-full mt-1">
                                    <button
                                        onClick={closeResetModal}
                                        className="flex-1 px-4 py-2.5 rounded-full text-sm font-semibold text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        onClick={beginReset}
                                        className="flex-1 px-4 py-2.5 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 via-blue-500 to-sky-400 shadow-lg shadow-blue-300/40 hover:scale-105 transition-transform"
                                    >
                                        Mulai
                                    </button>
                                </div>
                            </>
                        )}

                        {resetStep === "progress" && (
                            <>
                                <div className="w-20 h-20 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                                    <Smartphone className="w-9 h-9 text-textLight dark:text-textDark animate-figure8" />
                                </div>
                                <h2 className="text-base font-bold text-textLight dark:text-textDark">
                                    Terus gerakkan HP...
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                    Jangan berhenti dulu, arah kiblat lagi disetel ulang.
                                </p>
                                <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-indigo-600 via-blue-500 to-sky-400 transition-[width] duration-100 ease-linear"
                                        style={{ width: `${resetProgressPct}%` }}
                                    />
                                </div>
                                <p className="text-[11px] font-mono text-gray-400 dark:text-gray-600">
                                    Rotasi terdeteksi: {resetRotationDeg}°
                                </p>
                            </>
                        )}

                        {resetStep === "success" && (
                            <>
                                <div className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center animate-check-pop">
                                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                                </div>
                                <h2 className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                                    Berhasil disetel ulang
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                    Arah kiblat sekarang sudah lebih akurat.
                                </p>
                            </>
                        )}

                        {resetStep === "fail" && (
                            <>
                                <div className="w-20 h-20 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                                    <AlertTriangle className="w-9 h-9 text-amber-500" />
                                </div>
                                <h2 className="text-base font-bold text-amber-600 dark:text-amber-400">
                                    Belum berhasil
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                    {sensorError ?? "Gerakan belum cukup terdeteksi. Coba gerakkan HP lebih tegas membentuk pola angka 8, jauh dari benda logam atau magnet."}
                                </p>
                                <div className="flex gap-2 w-full mt-1">
                                    <button
                                        onClick={closeResetModal}
                                        className="flex-1 px-4 py-2.5 rounded-full text-sm font-semibold text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        Tutup
                                    </button>
                                    <button
                                        onClick={() => setResetStep("instruction")}
                                        className="flex-1 px-4 py-2.5 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 via-blue-500 to-sky-400 shadow-lg shadow-blue-300/40 hover:scale-105 transition-transform"
                                    >
                                        Coba Lagi
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}