const EXACT_MAP: Record<string, string> = {
    "Eid-ul-Fitr": "Idul Fitri",
    "Eid-ul-Adha": "Idul Adha",
    "Lailat-ul-Qadr": "Lailatul Qadr",
    "Hajj": "Haji",
    "Arafa": "Wukuf di Arafah",
    "1st Day of Ramadan": "1 Ramadhan",
    "Isra and Mi'raj": "Isra Mi'raj",
    "Isra and Mi'raj Night": "Malam Isra Mi'raj",
    "Mawlid": "Maulid Nabi",
    "Mawlid al-Nabi": "Maulid Nabi",
    "Mawlid an-Nabi": "Maulid Nabi",
    "Mawlid (Birth) Al-Nabi": "Maulid Nabi",
    "Islamic New Year": "Tahun Baru Islam",
    "Ashura": "Asyura",
    "Shab-e-Barat": "Nisfu Sya'ban",
    "Lailat al-Bara'ah": "Nisfu Sya'ban",
    "Ramadan Begins": "Mulai Ramadhan",
    "Ramadan": "Ramadhan",
}

const PREFIX_MAP: [RegExp, (match: string[]) => string][] = [
    [/^Urs of (.+?)\s*[（(]?[قق]?[)）]?\s*$/i, (m) => `Haul ${m[1]}`],
    [/^Martyrdom of (.+?)\s*[（(]?[ر]?[)）]?\s*$/i, (m) => `Syahidnya ${m[1]}`],
    [/^Birth of (.+?)\s*[（(]?[قق]?[)）]?\s*$/i, (m) => `Kelahiran ${m[1]}`],
    [/^First time Adhan was called.*$/i, () => "Adzan Pertama"],
]

export function translateHoliday(name: string): string {
    const exact = EXACT_MAP[name]
    if (exact) return exact

    for (const [pattern, replacer] of PREFIX_MAP) {
        const match = name.match(pattern)
        if (match) return replacer(match)
    }

    return name
}
