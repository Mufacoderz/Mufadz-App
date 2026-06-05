import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useUser } from "../../../hooks/useUser";
import { API_BASE_URL } from "../../../config/api";

interface DecodedToken {
    id: number;
    email: string;
    role: string;
    exp: number;
}

const LoginForm = () => {
    const navigate = useNavigate();
    const { refreshUser } = useUser();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (data.token) {
                localStorage.setItem("token", data.token);

                // ✅ Tunggu context fetch selesai dulu baru navigate
                // supaya role sudah tersedia saat AppContent render sidebar
                await refreshUser();

                const decoded = jwtDecode<DecodedToken>(data.token);

                if (decoded.role === "admin") {
                    navigate("/admin/dashboard", { replace: true });
                } else {
                    navigate("/", { replace: true });
                }
            } else {
                setError(data.message || "Login gagal");
            }
        } catch {
            setError("Terjadi kesalahan, coba lagi");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md w-full mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 tracking-wide">
                Masuk ke Akun
            </h2>

            <form className="space-y-4 sm:space-y-5" onSubmit={handleLogin}>
                <div>
                    <label className="block mb-2 text-sm sm:text-base font-medium">Email</label>
                    <input
                        type="email"
                        placeholder="email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-3 sm:p-3.5 rounded-lg bg-white/20 border border-white/30 focus:ring-2 focus:ring-blue-400 outline-none"
                    />
                </div>

                <div>
                    <label className="block mb-2 text-sm sm:text-base font-medium">Password</label>
                    <input
                        type="password"
                        placeholder="********"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-3 sm:p-3.5 rounded-lg bg-white/20 border border-white/30 focus:ring-2 focus:ring-blue-400 outline-none"
                    />
                </div>

                {error && (
                    <p className="text-red-400 text-sm text-center">{error}</p>
                )}

                <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: loading ? 1 : 1.03 }}
                    whileTap={{ scale: loading ? 1 : 0.97 }}
                    className="w-full bg-gradient-to-r from-indigo-600 via-blue-500 to-sky-400 text-white font-semibold px-5 py-3 rounded-lg disabled:opacity-70"
                >
                    {loading ? "Memproses..." : "Masuk"}
                </motion.button>
            </form>
        </div>
    );
};

export default LoginForm;
