import { Link } from "react-router-dom"

const RegistFooter = () => {
    return (
        <>
            <div className="mt-6 text-center text-xs sm:text-sm ">
                    Sudah punya akun?{" "}
                    <Link to="/login" className="text-blue-700 dark:text-blue-300 hover:underline">
                        Masuk
                    </Link>
                </div>
        </>
    )
}

export default RegistFooter
