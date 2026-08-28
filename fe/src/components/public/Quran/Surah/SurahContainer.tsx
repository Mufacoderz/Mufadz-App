import { useCallback, useState, useEffect } from "react";
import SurahList from "./SurahList";
import SearchSurah from "../SearchSurah";
import type { Surah } from "../../../../types/surah";

function SurahContainer() {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [filtered, setFiltered] = useState<Surah[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSurahs = async () => {
      try {
        const response = await fetch("https://equran.id/api/v2/surat");
        if (!response.ok) {
          throw new Error("Failed to fetch surahs");
        }
        const data = await response.json();
        setSurahs(data.data);
        setFiltered(data.data);
        setIsLoading(false);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Unknown error");
        setIsLoading(false);
      }
    };

    fetchSurahs();
  }, []);

  const handleSearch = useCallback((query: string) => {
    if (query.trim() === "") {
      setFiltered(surahs);
      return;
    }

    const q = query.toLowerCase();
    setFiltered(
      surahs.filter(
        (s) =>
          s.namaLatin.toLowerCase().includes(q) ||
          s.arti.toLowerCase().includes(q) ||
          String(s.nomor).includes(q)
      )
    );
  }, [surahs]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-5">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="h-16 rounded-2xl bg-blue-50/60 dark:bg-gray-800/40 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <>
      <SearchSurah onSearch={handleSearch} surahs={surahs} />
      <SurahList surahs={filtered} />
    </>
  );
}

export default SurahContainer;
