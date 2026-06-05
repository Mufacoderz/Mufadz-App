export const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5050";

export function getUploadUrl(filename: string) {
  return `${API_BASE_URL}/uploads/${filename}`;
}
