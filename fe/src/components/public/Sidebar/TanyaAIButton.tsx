import { Bot } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface FadzProps {
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function TanyaFadzAIButton({ setOpen }: FadzProps) {
    const navigate = useNavigate();
    const isLoggedIn = Boolean(localStorage.getItem("token"))

    const handleClick = () => {
        if (!isLoggedIn) {
            const goLogin = confirm("login dulu");
            if (goLogin) navigate("/login");
            return;
        }

        setOpen(false);
        navigate("/chatbot");
    };

    return (
        <div className="px-6 mt-3">
            <button
                onClick={handleClick}
                className="
                    relative overflow-hidden rounded-full
                    bg-gradient-to-r from-indigo-600 via-blue-500 to-sky-400
                    dark:from-sky-400 dark:via-blue-500 dark:to-indigo-600
                    text-white dark:text-gray-800 font-semibold px-5 py-2.5
                    shadow-lg shadow-blue-300/40 dark:shadow-blue-700/40
                    transition-all duration-300 ease-out
                    hover:scale-105 hover:shadow-blue-400/50
                    focus:outline-none w-fit group
                "
            >
                <span className="relative z-10 flex items-center gap-2">
                    Tanya Fadz AI
                    <Bot />
                </span>
                <span className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] animate-[shine_2.5s_infinite]" />
            </button>
        </div>
    );
}
