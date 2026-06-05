import { useRef, useState } from "react";
import { uploadAvatar } from "../../../services/profileService";
import { getUploadUrl } from "../../../config/api";

type Props = {
    name: string;
    profileImage: string | null;
    role: string;
    onAvatarUpdated: () => void;
};

function ProfileAvatar({ name, profileImage, onAvatarUpdated }: Props) {
    const fileRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [hover, setHover] = useState(false);

    const avatarUrl = profileImage ? getUploadUrl(profileImage) : null;
    const initials = name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            await uploadAvatar(file);
            onAvatarUpdated();
        } catch {
            alert("Gagal upload foto");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div
            className="relative cursor-pointer shrink-0"
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            onClick={() => fileRef.current?.click()}
        >
            {avatarUrl ? (
                <img
                    src={avatarUrl}
                    alt={name}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover ring-4 ring-white dark:ring-gray-800 shadow-lg"
                />
            ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center ring-4 ring-white dark:ring-gray-800 shadow-lg">
                    <span className="text-3xl font-bold text-white">{initials}</span>
                </div>
            )}

            {/* Upload overlay */}
            <div className={`absolute inset-0 rounded-full bg-black/50 flex flex-col items-center justify-center transition-opacity duration-200 ${hover || uploading ? "opacity-100" : "opacity-0"}`}>
                {uploading ? (
                    <svg className="w-6 h-6 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                ) : (
                    <>
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-white text-[10px] mt-0.5 font-medium">Ganti</span>
                    </>
                )}
            </div>

            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </div>
    );
}

export default ProfileAvatar;
