
import MorphingShape2 from "../../components/public/Blob2";
import RegistForm from "../../components/public/Register/RegistForm";
import RegistFooter from "../../components/public/Register/RegistFooter";

export default function Register() {
    return (
        <div className="flex items-center justify-center min-h-screen dark:bg-gray-900">
            <MorphingShape2/>
            <div
                className="sm:w-full max-w-md  bg-white/10 backdrop-blur-md border border-white/20 dark:border-gray-700/20 p-8 rounded-2xl shadow-2xl text-gray-700 dark:text-gray-300"
            >

                <RegistForm/>
                <RegistFooter/>
                
            </div>
        </div>
    );
}
