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
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <>
      <SearchSurah onSearch={handleSearch} surahs={surahs} />
      <SurahList surahs={filtered} />
    </>
  );
}

export default SurahContainer;
