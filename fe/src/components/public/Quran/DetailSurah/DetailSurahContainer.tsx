import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import type { Surah } from "../../../../types/surah";
import { getReciterName } from "../../../../constants/reciters";
import DetailSurah from "./DetailSurah";

function DetailSurahContainer() {
  const { surahId } = useParams<{ surahId: string }>();
  const [surah, setSurah] = useState<Surah | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentReciter, setCurrentReciter] = useState("05");
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [currentAyatIndex, setCurrentAyatIndex] = useState<number | null>(null);
  const [progress, setProgress] = useState({ currentTime: 0, duration: 0 });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentReciterRef = useRef(currentReciter);
  useEffect(() => {
    currentReciterRef.current = currentReciter;
  }, [currentReciter]);

  useEffect(() => {
    const fetchSurah = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://equran.id/api/v2/surat/${surahId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch surah data");
        }
        const data = await response.json();
        setSurah(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchSurah();
  }, [surahId]);

  // Reset player & MediaSession metadata tiap pindah supaya info surah
  // sebelumnya tidak nyangkut di notification shade / lock screen.
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    setCurrentAyatIndex(null);
    setAudioPlaying(false);
    setProgress({ currentTime: 0, duration: 0 });
    if ("mediaSession" in navigator) {
      navigator.mediaSession.metadata = null;
    }
  }, [surahId]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  const cleanupAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onended = null;
      audioRef.current.ontimeupdate = null;
      audioRef.current.onloadedmetadata = null;
      audioRef.current.src = "";
    }
  };

  const playAyat = useCallback(
    (index: number, reciterId?: string) => {
      if (!surah) return;
      const target = surah.ayat[index];
      if (!target) return;

      const activeReciter = reciterId ?? currentReciterRef.current;
      currentReciterRef.current = activeReciter;

      cleanupAudio();

      const audio = new Audio(target.audio[activeReciter]);
      audioRef.current = audio;

      // Set MediaSession metadata — muncul di notification shade & lock screen.
      // Artwork pakai icon PWA yang sama biar konsisten di semua platform.
      if ("mediaSession" in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: `Ayat ${target.nomorAyat} — ${surah.namaLatin}`,
          artist: getReciterName(activeReciter),
          album: "Mufadz Portal · Al-Qur'an",
          artwork: [
            { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
            { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
          ],
        });
      }

      audio.ontimeupdate = () => {
        setProgress({ currentTime: audio.currentTime, duration: audio.duration || 0 });
      };
      audio.onloadedmetadata = () => {
        setProgress((prev) => ({ ...prev, duration: audio.duration || 0 }));
      };
      audio.onended = () => {
        const nextIndex = index + 1;
        if (surah.ayat[nextIndex]) {
          playAyat(nextIndex);
        } else {
          setAudioPlaying(false);
        }
      };

      audio.play();
      setCurrentAyatIndex(index);
      setAudioPlaying(true);
      setProgress({ currentTime: 0, duration: 0 });
    },
    [surah]
  );

  const handlePauseAudio = () => {
    audioRef.current?.pause();
    setAudioPlaying(false);
  };

  const handleTogglePlay = () => {
    if (audioPlaying) {
      handlePauseAudio();
    } else if (currentAyatIndex !== null && audioRef.current) {
      audioRef.current.play();
      setAudioPlaying(true);
    } else if (currentAyatIndex !== null) {
      playAyat(currentAyatIndex);
    } else {
      playAyat(0);
    }
  };

  const handlePlayNext = () => {
    if (currentAyatIndex === null || !surah) return;
    const next = currentAyatIndex + 1;
    if (surah.ayat[next]) playAyat(next);
  };

  const handlePlayPrev = () => {
    if (currentAyatIndex === null || !surah) return;
    const prev = currentAyatIndex - 1;
    if (surah.ayat[prev]) playAyat(prev);
  };

  const handleSeek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress((prev) => ({ ...prev, currentTime: time }));
    }
  };

  const changeReciter = (reciterId: string) => {
    currentReciterRef.current = reciterId;
    setCurrentReciter(reciterId);
    if (currentAyatIndex !== null) {
      playAyat(currentAyatIndex, reciterId);
    }
  };

  // Daftarkan action handlers MediaSession tanpa dependency array supaya
  // selalu baca state terbaru tiap render (handlePlayPrev/Next/Seekfresh).
  // Cleanup null-kan semua handler saat unmount.
  useEffect(() => {
    if (!("mediaSession" in navigator)) return;

    navigator.mediaSession.setActionHandler("play", () => {
      audioRef.current?.play();
      setAudioPlaying(true);
    });
    navigator.mediaSession.setActionHandler("pause", () => {
      audioRef.current?.pause();
      setAudioPlaying(false);
    });
    navigator.mediaSession.setActionHandler("previoustrack", handlePlayPrev);
    navigator.mediaSession.setActionHandler("nexttrack", handlePlayNext);
    navigator.mediaSession.setActionHandler("seekto", (details) => {
      if (details.seekTime !== undefined) handleSeek(details.seekTime);
    });

    return () => {
      navigator.mediaSession.setActionHandler("play", null);
      navigator.mediaSession.setActionHandler("pause", null);
      navigator.mediaSession.setActionHandler("previoustrack", null);
      navigator.mediaSession.setActionHandler("nexttrack", null);
      navigator.mediaSession.setActionHandler("seekto", null);
    };
  });

  // Sync playbackState supaya ikon play/pause di lock screen selalu benar.
  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    navigator.mediaSession.playbackState = audioPlaying ? "playing" : "paused";
  }, [audioPlaying]);

  if (loading) {
    return <div className="p-5 text-center">Memuat...</div>;
  }

  if (error || !surah) {
    return (
      <div className="p-5 text-center text-red-500">
        Error: {error || "Surah tidak ditemukan"}
      </div>
    );
  }

  return (
    <DetailSurah
      surah={surah}
      currentReciter={currentReciter}
      changeReciter={changeReciter}
      onPlay={handleTogglePlay}
      onPause={handlePauseAudio}
      audioPlaying={audioPlaying}
      currentAyatIndex={currentAyatIndex}
      progress={progress}
      onPlayAyat={playAyat}
      onPlayNext={handlePlayNext}
      onPlayPrev={handlePlayPrev}
      onTogglePlay={handleTogglePlay}
      onSeek={handleSeek}
    />
  );
}

export default DetailSurahContainer;
