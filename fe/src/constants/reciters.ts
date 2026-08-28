export type Reciter = {
  id: string;
  name: string;
};

export const RECITERS: Reciter[] = [
  { id: "01", name: "Abdullah Al-Juhany" },
  { id: "02", name: "Abdul Muhsin Al-Qasim" },
  { id: "03", name: "Abdurrahman as-Sudais" },
  { id: "04", name: "Ibrahim Al-Dossari" },
  { id: "05", name: "Misyari Rasyid Al-Afasi" },
];

export const getReciterName = (id: string): string =>
  RECITERS.find((r) => r.id === id)?.name ?? "Qari";
