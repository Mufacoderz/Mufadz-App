import Logo from '../../../assets/logo.webp'
import { Link } from 'react-router-dom'

const HeaderSidebarAdmin = () => {
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
                <div className="group flex items-center gap-3 p-2 transition bg-gray-100 hover:bg-green-50 dark:bg-gray-800 dark:hover:bg-green-950 rounded-md">
                    <div className="greeting flex flex-col">
                        <h2 className="font-semibold text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
                            Admin Panel
                        </h2>
                        <Link to="/admin/settings" className="text-xs text-gray-500 hover:text-green-500 dark:hover:text-green-500">
                            Settings
                        </Link>
                    </div>
                </div>
            </div>
        </>
    )
}

export default HeaderSidebarAdmin