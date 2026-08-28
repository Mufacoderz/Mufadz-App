import { useState, useRef, useEffect, useCallback } from "react";
import type { Surah } from "../../../types/surah";

type SearchSurahProps = {
    onSearch: (query: string) => void;
    surahs?: Surah[];
};

// debounce helper — tunda eksekusi sampai user berhenti ngetik
function useDebounce<T>(value: T, delay: number): [T, () => void] {
    const [debounced, setDebounced] = useState(value);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        timerRef.current = setTimeout(() => setDebounced(value), delay);
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [value, delay]);

    const reset = useCallback(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        setDebounced(value);
    }, [value]);

    return [debounced, reset];
}

function SearchSurah({ onSearch, surahs = [] }: SearchSurahProps) {
    const [query, setQuery] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const [suggestions, setSuggestions] = useState<Surah[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const justSelectedRef = useRef(false);

    const [debouncedQuery, resetDebounce] = useDebounce(query, 250);

    useEffect(() => {
        if (justSelectedRef.current) {
            justSelectedRef.current = false;
            return;
        }
        const q = debouncedQuery.trim().toLowerCase();
        if (!q) {
            setSuggestions([]);
            onSearch("");
            return;
        }

        const filtered = surahs.filter(
            (s) =>
                s.namaLatin.toLowerCase().includes(q) ||
                s.arti.toLowerCase().includes(q) ||
                String(s.nomor).includes(q)
        );

        setSuggestions(filtered.slice(0, 5));
        onSearch(debouncedQuery);
    }, [debouncedQuery, onSearch, surahs]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value); // input tetap responsif
        // onSearch TIDAK dipanggil di sini — biar debounce yang handle
    };

    const handleClear = useCallback(() => {
        setQuery("");
        setSuggestions([]);
        resetDebounce();
        onSearch("");
        inputRef.current?.focus();
    }, [onSearch, resetDebounce]);

    const handleSelectSuggestion = useCallback((surah: Surah) => {
        justSelectedRef.current = true;
        setQuery(surah.namaLatin);
        onSearch(surah.namaLatin);
        setSuggestions([]);
    }, [onSearch]);

    return (
        <div className="px-5 pb-2 relative">
            <div
                className={`flex items-center gap-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm
                    border rounded-2xl px-4 py-3 shadow-sm transition-all duration-300
                    ${isFocused
                        ? "border-blue-500 dark:border-blue-400 shadow-md shadow-blue-100 dark:shadow-blue-900/30"
                        : "border-blue-100 dark:border-gray-700"
                    }`}
            >
                <svg
                    className={`w-5 h-5 shrink-0 transition-colors duration-300 ${isFocused ? "text-blue-500 dark:text-blue-400" : "text-gray-400 dark:text-gray-500"}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>

                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={handleChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder="Cari surah atau arti..."
                    className="flex-1 bg-transparent outline-none text-sm text-gray-700 dark:text-gray-300
                        placeholder:text-gray-400 dark:placeholder:text-gray-500"
                />

                {query && (
                    <button
                        onClick={handleClear}
                        className="shrink-0 w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center
                            hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors duration-200"
                    >
                        <svg className="w-3 h-3 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                )}
            </div>

            {suggestions.length > 0 && (
                <div className="absolute left-5 right-5 top-[calc(100%-4px)] z-50
                    bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm
                    border border-blue-100 dark:border-gray-700 rounded-2xl shadow-lg
                    overflow-hidden">
                    {suggestions.map((surah, index) => (
                        <button
                            key={surah.nomor}
                            onMouseDown={() => handleSelectSuggestion(surah)}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-left
                                hover:bg-blue-50 dark:hover:bg-gray-700/60 transition-colors duration-150
                                ${index !== suggestions.length - 1 ? "border-b border-blue-50 dark:border-gray-700/50" : ""}`}
                        >
                            <span className="text-xs font-bold text-blue-500 dark:text-blue-400 w-6 shrink-0 text-center">
                                {surah.nomor}
                            </span>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 truncate">{surah.namaLatin}</p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{surah.arti}</p>
                            </div>
                            <p className="text-lg text-gray-700 dark:text-gray-300 shrink-0" style={{ fontFamily: "'Amiri', serif" }}>
                                {surah.nama}
                            </p>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export default SearchSurah;
