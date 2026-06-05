type Ayat = {
    nomorAyat: number;
    teksArab: string;
    teksLatin: string;
    teksIndonesia: string;
    audio: Record<string, string>;
};

type RelatedSurah = {
    nomor: number;
    namaLatin: string;
};

type Surah = {
    nomor: number;
    nama: string;
    namaLatin: string;
    arti: string;
    tempatTurun: string;
    jumlahAyat: number;
    deskripsi: string;
    audioFull: Record<string, string>;
    ayat: Ayat[];
    prevSurah: RelatedSurah | null;
    nextSurah: RelatedSurah | null;
};

export type { Ayat, Surah, RelatedSurah };
