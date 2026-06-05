import { Link } from "react-router-dom"
const LoginFooter = () => {
    return (
        <>
            <div className="mt-6 text-center text-xs sm:text-sm ">
                Belum punya akun?{" "}
                <Link to="/register" className="text-blue-700 dark:text-blue-300 hover:underline">
                    Registrasi
                </Link>
            </div>
        </>
    )
}

export default LoginFooter
