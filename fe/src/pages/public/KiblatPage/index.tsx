import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation, X, Smartphone, CheckCircle2, AlertTriangle, MapPin, LocateFixed } from "lucide-react";
import { MapContainer, TileLayer, useMapEvents } from "react-leaflet";
import type { Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";

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

// Nempel di dalam <MapContainer>. Karena pin-nya sekarang cuma overlay diam
// di tengah layar, titik yang "dipilih" itu ya titik tengah peta itu sendiri —
// jadi geser peta kemana pun (gak perlu presisi kena icon) otomatis mindahin titik.
function MapCenterTracker({
    onMoveEnd,
    onDragStart,
}: {
    onMoveEnd: (c: Coords) => void;
    onDragStart: () => void;
}) {
    useMapEvents({
        movestart: () => onDragStart(),
        moveend: (e) => {
            const c = e.target.getCenter();
            onMoveEnd({ lat: c.lat, lon: c.lng });
        },
    });
    return null;
}

type Coords = { lat: number; lon: number };
type ResetStep = "idle" | "instruction" | "progress" | "success" | "fail";
type ModalPurpose = "activate" | "recalibrate";

const dialSize = "min(80vw, 336px)";
const CARDINALS: Record<number, string> = { 0: "U", 90: "T", 180: "S", 270: "B" };

// Berapa lama proses "setel ulang" berjalan sebelum dievaluasi hasilnya
const RESET_DURATION_MS = 5000;
// Total akumulasi perubahan sudut (derajat) selama proses berlangsung,
// dipakai sebagai bukti bahwa HP benar-benar digerakkan (bukan cuma didiemin)
const RESET_MOVE_THRESHOLD = 220;
// GPS HP biasa jitter ±5-15m walau diem di tempat. Update posisi cuma
// dianggap valid kalau pergeserannya lebih dari ini, biar gak itung ulang
// bearing tiap ada getaran receh dari sensor.
const MIN_LOCATION_DELTA_KM = 0.02;

// Opsi lokasi "cepat": prioritas kecepatan & keberhasilan, bukan presisi.
// Dipakai buat nebak titik awal peta manual & fallback kalau GPS presisi
// gagal — soalnya Ka'bah jauh banget, geseran lokasi beberapa km nyaris
// gak ngubah hasil bearing sama sekali.
const GEO_OPTIONS_FAST: PositionOptions = { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 };
// Opsi presisi tinggi buat aktivasi GPS utama. Timeout dilonggarin (dari
// 6s ke 15s) karena GPS chip butuh waktu buat nangkep sinyal, apalagi di
// dalam ruangan — ini yang bikin tombol GPS sering keliatan "gagal terus"
// padahal cuma butuh waktu lebih.
const GEO_OPTIONS_PRECISE: PositionOptions = { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 };

export default function KiblatPage() {
    const navigate = useNavigate();
    const [hasLocated, setHasLocated] = useState(false);
    const [heading, setHeading] = useState(0);
    const [bearing, setBearing] = useState(0);
    const [distanceKm, setDistanceKm] = useState(0);
    const [aligned, setAligned] = useState(false);
    const [usingRealSensor, setUsingRealSensor] = useState(false);
    const [accuracy, setAccuracy] = useState<number | null>(null);
    const [sensorError, setSensorError] = useState<string | null>(null);

    // Alur modal "Aktifkan Kompas" / "Setel Ulang Arah" — dua konteks beda,
    // satu komponen modal yang sama (cuma copy teksnya nyesuain)
    const [resetStep, setResetStep] = useState<ResetStep>("idle");
    const [resetProgressPct, setResetProgressPct] = useState(0);
    const [resetRotationDeg, setResetRotationDeg] = useState(0);
    const modalPurposeRef = useRef<ModalPurpose>("activate");

    // Alur "Atur Lokasi Manual" (modal peta)
    const [manualModalOpen, setManualModalOpen] = useState(false);
    const [manualMarker, setManualMarker] = useState<Coords | null>(null);
    const [manualMapKey, setManualMapKey] = useState(0);
    const [isPinLifted, setIsPinLifted] = useState(false);
    const [locatingMe, setLocatingMe] = useState(false);
    const lastKnownCoordsRef = useRef<Coords | null>(null);
    const mapRef = useRef<LeafletMap | null>(null);
    const geoWatchIdRef = useRef<number | null>(null);

    const headingRef = useRef(0);
    const sensorWatchdogRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const sensorRequestedRef = useRef(false);

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

    const computeAndShow = useCallback((lat: number, lon: number) => {
        const b = computeBearing(lat, lon, KAABA.lat, KAABA.lon);
        const d = computeDistance(lat, lon, KAABA.lat, KAABA.lon);
        setBearing(b);
        setDistanceKm(d);
        updateCompass(headingRef.current, b, d);
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
        if (sensorRequestedRef.current) return;
        sensorRequestedRef.current = true;

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

    // Cleanup timer/interval punya alur modal kompas
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

    // Update posisi dari watchPosition — cuma dipakai kalau pergeserannya
    // cukup berarti (bukan noise GPS), biar dial gak "gemeteran" sendiri.
    const handleGeoUpdate = useCallback((pos: GeolocationPosition) => {
        const loc = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        const prev = lastKnownCoordsRef.current;
        if (prev) {
            const movedKm = computeDistance(prev.lat, prev.lon, loc.lat, loc.lon);
            if (movedKm < MIN_LOCATION_DELTA_KM) return;
        }
        lastKnownCoordsRef.current = loc;
        computeAndShow(loc.lat, loc.lon);
    }, [computeAndShow]);

    const stopWatchingLocation = useCallback(() => {
        if (geoWatchIdRef.current !== null) {
            navigator.geolocation.clearWatch(geoWatchIdRef.current);
            geoWatchIdRef.current = null;
        }
    }, []);

    const startWatchingLocation = useCallback(() => {
        if (!navigator.geolocation || geoWatchIdRef.current !== null) return;
        geoWatchIdRef.current = navigator.geolocation.watchPosition(
            handleGeoUpdate,
            () => { /* sinyal GPS sempat putus, diamkan & pakai posisi terakhir */ },
            { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
        );
    }, [handleGeoUpdate]);

    // Watch GPS berhenti otomatis kalau halaman ditinggalkan, biar gak
    // nguras baterai di background.
    useEffect(() => {
        return () => stopWatchingLocation();
    }, [stopWatchingLocation]);

    // CTA "Aktifkan Otomatis (GPS)". Lokasi & tampilan kiblat langsung
    // ditentukan begitu GPS berhasil — modal figure-8 di bawah ini sifatnya
    // cuma pelengkap buat naikkin akurasi sensor arah, bukan syarat.
    const handleAutoActivate = () => {
        // Diminta di sini, sinkron di dalam handler klik, biar iOS Safari
        // menganggap ini masih bagian dari gesture user (syarat requestPermission()).
        requestOrientation();

        if (!navigator.geolocation) {
            openManualLocation();
            return;
        }

        const onLocated = (pos: GeolocationPosition) => {
            const loc = { lat: pos.coords.latitude, lon: pos.coords.longitude };
            lastKnownCoordsRef.current = loc;
            computeAndShow(loc.lat, loc.lon);
            setHasLocated(true);
            modalPurposeRef.current = "activate";
            setResetStep("instruction");
            startWatchingLocation();
        };

        navigator.geolocation.getCurrentPosition(
            onLocated,
            () => {
                // Percobaan presisi tinggi gagal/timeout — paling sering gara-gara
                // GPS chip belum sempat nangkep sinyal (di dalam ruangan/gedung).
                // Coba sekali lagi pakai mode cepat (wifi/cell, bukan GPS chip)
                // sebelum benar-benar nyerah ke lokasi manual.
                navigator.geolocation.getCurrentPosition(
                    onLocated,
                    () => {
                        // Dua-duanya tetap gagal (kemungkinan besar izin lokasi
                        // ditolak) -> jangan diam-diam nebak Jakarta, biarkan user
                        // nentuin sendiri titiknya di peta.
                        openManualLocation();
                    },
                    GEO_OPTIONS_FAST
                );
            },
            GEO_OPTIONS_PRECISE
        );
    };

    // Buka modal peta lokasi manual. Titik awal pin dari lokasi terakhir
    // yang diketahui (kalau ada). Kalau belum ada sama sekali, modal tetap
    // dibuka instan pakai Jakarta cuma sebagai placeholder sementara — TAPI
    // langsung nembak lokasi asli user di background, dan begitu dapat,
    // peta "flyTo" pindah ke situ. Jadi user tinggal geser dikit buat
    // presisi, bukan geser jauh dari Jakarta ke lokasi aslinya.
    const openManualLocation = () => {
        const seed = lastKnownCoordsRef.current ?? { lat: JAKARTA.lat, lon: JAKARTA.lon };
        setManualMarker(seed);
        setManualMapKey((k) => k + 1);
        setManualModalOpen(true);

        if (!lastKnownCoordsRef.current && navigator.geolocation) {
            setLocatingMe(true);
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const c = { lat: pos.coords.latitude, lon: pos.coords.longitude };
                    lastKnownCoordsRef.current = c;
                    setLocatingMe(false);
                    if (mapRef.current) {
                        // flyTo bakal trigger moveend sendiri, yang otomatis
                        // nge-sync manualMarker ke titik baru ini
                        mapRef.current.flyTo([c.lat, c.lon], 15);
                    } else {
                        setManualMarker(c);
                    }
                },
                () => setLocatingMe(false),
                GEO_OPTIONS_FAST
            );
        }
    };

    const cancelManualLocation = () => {
        setManualModalOpen(false);
    };

    const confirmManualLocation = () => {
        if (!manualMarker) return;
        stopWatchingLocation();
        lastKnownCoordsRef.current = manualMarker;
        computeAndShow(manualMarker.lat, manualMarker.lon);
        setHasLocated(true);
        setManualModalOpen(false);
    };

    const handleMapMoveEnd = useCallback((c: Coords) => {
        setManualMarker(c);
        setIsPinLifted(false);
    }, []);

    const handleMapDragStart = useCallback(() => {
        setIsPinLifted(true);
    }, []);

    const locateMeInManual = () => {
        if (!navigator.geolocation) return;
        setLocatingMe(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const c = { lat: pos.coords.latitude, lon: pos.coords.longitude };
                setLocatingMe(false);
                if (mapRef.current) {
                    // flyTo bakal trigger moveend sendiri, yang otomatis
                    // nge-sync manualMarker ke titik baru ini
                    mapRef.current.flyTo([c.lat, c.lon], 15);
                } else {
                    setManualMarker(c);
                }
            },
            () => setLocatingMe(false),
            GEO_OPTIONS_FAST
        );
    };

    // Buka modal "Setel Ulang Arah" (recalibrasi, dipakai setelah aktif).
    // Kalau sensor memang lagi error total, langsung tampilkan status gagal
    // dengan alasan yang sama persis dengan kartu error di atas.
    const openResetModal = () => {
        modalPurposeRef.current = "recalibrate";
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

    const isActivateModal = modalPurposeRef.current === "activate";

    return (
        <div className="w-full dark:bg-gray-900 min-h-dvh flex flex-col items-center justify-center p-4 relative overflow-hidden">
            <div className="flex flex-col items-center gap-5 w-full max-w-xs">
                <div className="flex items-center justify-between w-full">
                    <span className="text-[10px] font-bold tracking-widest text-textLight dark:text-textDark uppercase">
                        Mufadz · Kompas Kiblat
                    </span>
                    <button onClick={() => navigate("/")} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray    onDragStart: () => void;
}) {
    useMapEvents({
        movestart: () => onDragStart(),
        moveend: (e) => {
            const c = e.target.getCenter();
            onMoveEnd({ lat: c.lat, lon: c.lng });
        },
    });
    return null;
}

type Coords = { lat: number; lon: number };
type ResetStep = "idle" | "instruction" | "progress" | "success" | "fail";
type ModalPurpose = "activate" | "recalibrate";

const dialSize = "min(80vw, 336px)";
const CARDINALS: Record<number, string> = { 0: "U", 90: "T", 180: "S", 270: "B" };

// Berapa lama proses "setel ulang" berjalan sebelum dievaluasi hasilnya
const RESET_DURATION_MS = 5000;
// Total akumulasi perubahan sudut (derajat) selama proses berlangsung,
// dipakai sebagai bukti bahwa HP benar-benar digerakkan (bukan cuma didiemin)
const RESET_MOVE_THRESHOLD = 220;
// GPS HP biasa jitter ±5-15m walau diem di tempat. Update posisi cuma
// dianggap valid kalau pergeserannya lebih dari ini, biar gak itung ulang
// bearing tiap ada getaran receh dari sensor.
const MIN_LOCATION_DELTA_KM = 0.02;

export default function KiblatPage() {
    const navigate = useNavigate();
    const [hasLocated, setHasLocated] = useState(false);
    const [heading, setHeading] = useState(0);
    const [bearing, setBearing] = useState(0);
    const [distanceKm, setDistanceKm] = useState(0);
    const [aligned, setAligned] = useState(false);
    const [usingRealSensor, setUsingRealSensor] = useState(false);
    const [accuracy, setAccuracy] = useState<number | null>(null);
    const [sensorError, setSensorError] = useState<string | null>(null);

    // Alur modal "Aktifkan Kompas" / "Setel Ulang Arah" — dua konteks beda,
    // satu komponen modal yang sama (cuma copy teksnya nyesuain)
    const [resetStep, setResetStep] = useState<ResetStep>("idle");
    const [resetProgressPct, setResetProgressPct] = useState(0);
    const [resetRotationDeg, setResetRotationDeg] = useState(0);
    const modalPurposeRef = useRef<ModalPurpose>("activate");

    // Alur "Atur Lokasi Manual" (modal peta)
    const [manualModalOpen, setManualModalOpen] = useState(false);
    const [manualMarker, setManualMarker] = useState<Coords | null>(null);
    const [manualMapKey, setManualMapKey] = useState(0);
    const [isPinLifted, setIsPinLifted] = useState(false);
    const [locatingMe, setLocatingMe] = useState(false);
    const lastKnownCoordsRef = useRef<Coords | null>(null);
    const mapRef = useRef<LeafletMap | null>(null);
    const geoWatchIdRef = useRef<number | null>(null);

    const headingRef = useRef(0);
    const sensorWatchdogRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const sensorRequestedRef = useRef(false);

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

    const computeAndShow = useCallback((lat: number, lon: number) => {
        const b = computeBearing(lat, lon, KAABA.lat, KAABA.lon);
        const d = computeDistance(lat, lon, KAABA.lat, KAABA.lon);
        setBearing(b);
        setDistanceKm(d);
        updateCompass(headingRef.current, b, d);
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
        if (sensorRequestedRef.current) return;
        sensorRequestedRef.current = true;

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

    // Cleanup timer/interval punya alur modal kompas
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

    // Update posisi dari watchPosition — cuma dipakai kalau pergeserannya
    // cukup berarti (bukan noise GPS), biar dial gak "gemeteran" sendiri.
    const handleGeoUpdate = useCallback((pos: GeolocationPosition) => {
        const loc = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        const prev = lastKnownCoordsRef.current;
        if (prev) {
            const movedKm = computeDistance(prev.lat, prev.lon, loc.lat, loc.lon);
            if (movedKm < MIN_LOCATION_DELTA_KM) return;
        }
        lastKnownCoordsRef.current = loc;
        computeAndShow(loc.lat, loc.lon);
    }, [computeAndShow]);

    const stopWatchingLocation = useCallback(() => {
        if (geoWatchIdRef.current !== null) {
            navigator.geolocation.clearWatch(geoWatchIdRef.current);
            geoWatchIdRef.current = null;
        }
    }, []);

    const startWatchingLocation = useCallback(() => {
        if (!navigator.geolocation || geoWatchIdRef.current !== null) return;
        geoWatchIdRef.current = navigator.geolocation.watchPosition(
            handleGeoUpdate,
            () => { /* sinyal GPS sempat putus, diamkan & pakai posisi terakhir */ },
            { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
        );
    }, [handleGeoUpdate]);

    // Watch GPS berhenti otomatis kalau halaman ditinggalkan, biar gak
    // nguras baterai di background.
    useEffect(() => {
        return () => stopWatchingLocation();
    }, [stopWatchingLocation]);

    // CTA "Aktifkan Otomatis (GPS)". Lokasi & tampilan kiblat langsung
    // ditentukan begitu GPS berhasil — modal figure-8 di bawah ini sifatnya
    // cuma pelengkap buat naikkin akurasi sensor arah, bukan syarat.
    const handleAutoActivate = () => {
        // Diminta di sini, sinkron di dalam handler klik, biar iOS Safari
        // menganggap ini masih bagian dari gesture user (syarat requestPermission()).
        requestOrientation();

        if (!navigator.geolocation) {
            openManualLocation();
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const loc = { lat: pos.coords.latitude, lon: pos.coords.longitude };
                lastKnownCoordsRef.current = loc;
                computeAndShow(loc.lat, loc.lon);
                setHasLocated(true);
                modalPurposeRef.current = "activate";
                setResetStep("instruction");
                startWatchingLocation();
            },
            () => {
                // Lokasi gagal didapat -> jangan diam-diam nebak Jakarta,
                // biarkan user nentuin sendiri titiknya di peta.
                openManualLocation();
            },
            { timeout: 6000, enableHighAccuracy: true }
        );
    };

    // Buka modal peta lokasi manual. Titik awal pin dari lokasi terakhir
    // yang diketahui (kalau ada), atau Jakarta sebagai starting point.
    const openManualLocation = () => {
        const seed = lastKnownCoordsRef.current ?? { lat: JAKARTA.lat, lon: JAKARTA.lon };
        setManualMarker(seed);
        setManualMapKey((k) => k + 1);
        setManualModalOpen(true);
    };

    const cancelManualLocation = () => {
        setManualModalOpen(false);
    };

    const confirmManualLocation = () => {
        if (!manualMarker) return;
        stopWatchingLocation();
        lastKnownCoordsRef.current = manualMarker;
        computeAndShow(manualMarker.lat, manualMarker.lon);
        setHasLocated(true);
        setManualModalOpen(false);
    };

    const handleMapMoveEnd = useCallback((c: Coords) => {
        setManualMarker(c);
        setIsPinLifted(false);
    }, []);

    const handleMapDragStart = useCallback(() => {
        setIsPinLifted(true);
    }, []);

    const locateMeInManual = () => {
        if (!navigator.geolocation) return;
        setLocatingMe(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const c = { lat: pos.coords.latitude, lon: pos.coords.longitude };
                setLocatingMe(false);
                if (mapRef.current) {
                    // flyTo bakal trigger moveend sendiri, yang otomatis
                    // nge-sync manualMarker ke titik baru ini
                    mapRef.current.flyTo([c.lat, c.lon], 15);
                } else {
                    setManualMarker(c);
                }
            },
            () => setLocatingMe(false),
            { timeout: 6000, enableHighAccuracy: true }
        );
    };

    // Buka modal "Setel Ulang Arah" (recalibrasi, dipakai setelah aktif).
    // Kalau sensor memang lagi error total, langsung tampilkan status gagal
    // dengan alasan yang sama persis dengan kartu error di atas.
    const openResetModal = () => {
        modalPurposeRef.current = "recalibrate";
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

    const isActivateModal = modalPurposeRef.current === "activate";

    return (
        <div className="w-full dark:bg-gray-900 min-h-dvh flex flex-col items-center justify-center p-4 relative overflow-hidden">
            <div className="flex flex-col items-center gap-5 w-full max-w-xs">
                <div className="flex items-center justify-between w-full">
                    <span className="text-[10px] font-bold tracking-widest text-textLight dark:text-textDark uppercase">
                        Mufadz · Kompas Kiblat
                    </span>
                    <button onClick={() => navigate("/")} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <X size={16} className="text-gray-400 dark:text-gray-500" />
                    </button>
                </div>

                {/* Accuracy badge / error — cuma relevan setelah aktif */}
                {hasLocated && !sensorError && (
                    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1 rounded-full border transition-colors ${accuracyClass}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {accuracyLabel}
                    </span>
                )}

                {hasLocated && sensorError && (
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
                                sensorRequestedRef.current = false;
                                requestOrientation();
                            }}
                            className="mt-4 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                        >
                            Coba Lagi
                        </button>
                    </div>
                )}

                {/* Dial — selalu tampil, aktif atau belum */}
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
                                    className={`w-[30px] h-[30px] rounded-[9px] flex items-center justify-center shadow-[0_0_0_3px_white,0_4px_14px_-2px_rgba(59,130,246,0.5)] dark:shadow-[0_0_0_3px_#111827,0_4px_14px_-2px_rgba(125,211,252,0.5)] bg-gradient-to-b from-textLight to-blue-700 dark:from-textDark dark:to-blue-500 transition-opacity ${hasLocated ? "opacity-100" : "opacity-40"}`}
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

                {hasLocated ? (
                    <>
                        {/* Readout */}
                        <div className="text-center transition-colors duration-300">
                            <p className={`text-sm font-bold transition-colors ${aligned ? "text-emerald-500 dark:text-emerald-400" : "text-textLight dark:text-textDark"}`}>
                                {aligned ? "Menghadap Kiblat" : "Arahkan HP untuk menemukan kiblat"}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-1">
                                Arah {Math.round(bearing)}° · {distanceKm.toLocaleString("id-ID", { maximumFractionDigits: 0 })} km ke Ka'bah
                            </p>
                        </div>

                        {/* Setel Ulang Arah & Atur Lokasi Manual */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={openResetModal}
                                className="text-[11px] font-semibold px-3 py-1.5 rounded-full border border-blue-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-textLight dark:hover:border-textDark hover:text-textLight dark:hover:text-textDark transition-all"
                            >
                                Setel ulang arah
                            </button>
                            <button
                                onClick={openManualLocation}
                                className="flex items-center gap-1 text-[11px] font-semibold px-3 py-1.5 rounded-full border border-blue-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-textLight dark:hover:border-textDark hover:text-textLight dark:hover:text-textDark transition-all"
                            >
                                <MapPin size={12} />
                                Atur lokasi manual
                            </button>
                        </div>

                        <p className="text-[10px] text-gray-400 dark:text-gray-600 text-center max-w-[260px] leading-relaxed">
                            Akurasi tergantung sensor perangkat. Jauhkan dari benda logam atau magnet untuk hasil terbaik.
                        </p>
                    </>
                ) : (
                    <>
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center leading-relaxed -mt-1">
                            Aktifkan buat menemukan arah kiblat dari lokasimu.
                        </p>

                        <div className="flex flex-col gap-2 w-full">
                            <button
                                onClick={handleAutoActivate}
                                className="relative overflow-hidden rounded-full bg-gradient-to-r from-indigo-600 via-blue-500 to-sky-400 dark:from-sky-400 dark:via-blue-500 dark:to-indigo-600 text-white dark:text-gray-800 font-semibold px-5 py-2.5 shadow-lg shadow-blue-300/40 dark:shadow-blue-700/40 transition-all duration-300 ease-out hover:scale-105 hover:shadow-blue-400/50 focus:outline-none w-full group"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    <Navigation size={16} />
                                    Aktifkan Otomatis (GPS)
                                </span>
                                <span className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] animate-[shine_2.5s_infinite]" />
                            </button>
                            <button
                                onClick={openManualLocation}
                                className="flex items-center justify-center gap-2 rounded-full border border-blue-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 font-semibold px-5 py-2.5 hover:border-textLight dark:hover:border-textDark hover:text-textLight dark:hover:text-textDark transition-all w-full"
                            >
                                <MapPin size={16} />
                                Atur Lokasi Manual
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* Modal Atur Lokasi Manual */}
            {manualModalOpen && manualMarker && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="animate-modal-pop relative w-full max-w-xs rounded-3xl bg-white dark:bg-gray-900 border border-blue-100 dark:border-gray-700 shadow-2xl overflow-hidden flex flex-col">

                        <button
                            onClick={cancelManualLocation}
                            className="absolute top-3 right-3 z-[510] w-7 h-7 rounded-full bg-white/90 dark:bg-gray-800/90 shadow border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            <X size={15} className="text-gray-500 dark:text-gray-400" />
                        </button>

                        <div className="relative w-full h-[260px]">
                            <MapContainer
                                key={manualMapKey}
                                ref={mapRef}
                                center={[manualMarker.lat, manualMarker.lon]}
                                zoom={14}
                                style={{ width: "100%", height: "100%" }}
                                scrollWheelZoom
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <MapCenterTracker onMoveEnd={handleMapMoveEnd} onDragStart={handleMapDragStart} />
                            </MapContainer>

                            {/* Pin diem di tengah, yang gerak itu petanya */}
                            <div
                                className="pointer-events-none absolute left-1/2 top-1/2 z-[500] flex flex-col items-center"
                                style={{ transform: "translate(-50%, -100%)" }}
                            >
                                <div
                                    className={`transition-transform duration-150 ease-out ${isPinLifted ? "-translate-y-2.5" : "translate-y-0"}`}
                                >
                                    <MapPin
                                        size={38}
                                        strokeWidth={2.2}
                                        className="text-blue-700 dark:text-textDark fill-blue-500/90 drop-shadow-[0_6px_6px_rgba(29,78,216,0.45)]"
                                    />
                                </div>
                                <div
                                    className={`h-1.5 rounded-full bg-black/30 blur-[1px] transition-all duration-150 ease-out ${isPinLifted ? "w-2 opacity-40" : "w-3.5 opacity-70"}`}
                                />
                            </div>

                            {/* Floating locate-me — icon doang, di pojok kiri bawah biar gak nabrak X */}
                            <button
                                onClick={locateMeInManual}
                                aria-label="Gunakan lokasi HP saat ini"
                                className="absolute bottom-3 left-3 z-[500] w-9 h-9 rounded-full bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
                            >
                                <LocateFixed
                                    size={17}
                                    className={`text-textLight dark:text-textDark ${locatingMe ? "animate-spin" : ""}`}
                                />
                            </button>
                        </div>

                        <div className="flex flex-col items-center gap-3 p-5">
                            <p className="text-[11px] font-mono text-gray-400 dark:text-gray-600">
                                {manualMarker.lat.toFixed(5)}, {manualMarker.lon.toFixed(5)}
                            </p>
                            <button
                                onClick={confirmManualLocation}
                                className="w-full px-4 py-2.5 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 via-blue-500 to-sky-400 shadow-lg shadow-blue-300/40 hover:scale-105 transition-transform"
                            >
                                Set Lokasi
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Aktifkan Kompas / Setel Ulang Arah */}
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
                                    {isActivateModal ? "Aktifkan Kompas" : "Setel Ulang Arah"}
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                    Pegang HP mendatar, lalu gerakkan membentuk pola angka 8 beberapa kali supaya arah kiblat makin akurat.
                                </p>
                                <div className="flex gap-2 w-full mt-1">
                                    <button
                                        onClick={closeResetModal}
                                        className="flex-1 px-4 py-2.5 rounded-full text-sm font-semibold text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        {isActivateModal ? "Lewati" : "Batal"}
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
                                    Jangan berhenti dulu, arah kiblat lagi {isActivateModal ? "disetel" : "disetel ulang"}.
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
                                    {isActivateModal ? "Kompas aktif" : "Berhasil disetel ulang"}
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
                                        {isActivateModal ? "Lewati" : "Tutup"}
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
