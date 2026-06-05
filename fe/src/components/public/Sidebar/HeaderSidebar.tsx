import ProfilKosong from '../../../assets/ProfilKosong.webp'
import Logo from '../../../assets/logo.png'
import { Link } from 'react-router-dom'
import { useUser } from '../../../hooks/useUser'
import { getUploadUrl } from '../../../config/api'

const HeaderSidebar = () => {
    const { user, isLoggedIn } = useUser();

    const avatarUrl = user?.profile_image
        ? getUploadUrl(user.profile_image)
        : null;

    const initials = user?.name
        ? user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
        : "??";

    return (
        <>
            <div className="flex items-center gap-3 p-3 border-b dark:border-gray-600 justify-center">
                <img
                    src={Logo}
                    alt="logo"
                    className="w-11 rounded-full transition-transform duration-300 hover:-translate-y-1 hover:rotate-3 border dark:border-gray-600"
                />
            </div>

            <div className="border-b dark:border-gray-600 py-2 px-1">
                {isLoggedIn && user ? (
                    <Link to="/profile">
                        <div className="group flex items-center gap-3 p-2 transition bg-gray-100 hover:bg-blue-50 dark:bg-gray-800 dark:hover:bg-blue-950 rounded-md">
                            <div className="ml-3 shrink-0">
                                {avatarUrl ? (
                                    <img
                                        src={avatarUrl}
                                        alt={user.name}
                                        className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-200 dark:ring-blue-700 transition-transform duration-300 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                                        <span className="text-xs font-bold text-white">{initials}</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col min-w-0">
                                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {user.name}
                                </p>
                                <p className="text-xs text-gray-400 dark:text-gray-500">
                                    {user.role === "admin" ? "Admin" : "User"}
                                </p>
                            </div>
                        </div>
                    </Link>
                ) : (
                    <div className="group flex items-center gap-3 p-2 transition bg-gray-100 hover:bg-green-50 dark:bg-gray-800 dark:hover:bg-green-950 rounded-md">
                        <img
                            src={ProfilKosong}
                            alt="profil"
                            className="ml-3 w-8 rounded-full transition-transform duration-300 group-hover:scale-110"
                        />
                        <div className="flex flex-col">
                            <h2 className="font-semibold text-sm text-gray-600 dark:text-gray-300">
                                <Link to="/login" className="hover:text-green-500 dark:hover:text-green-500">Masuk</Link>
                                {" / "}
                                <Link to="/register" className="hover:text-green-500 dark:hover:text-green-500">Daftar</Link>
                            </h2>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default HeaderSidebar;
