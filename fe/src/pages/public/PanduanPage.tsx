
import Footer from "../../components/public/Footer"
import PanduanHeading from "../../components/public/Panduan/PanduanHeading"
import PanduanList from "../../components/public/Panduan/PanduanList"
import PanduanSupport from "../../components/public/Panduan/PanduanSupport"

export default function Panduan() {


    return (
        <>
            <div className="w-full dark:bg-gray-900">
                <div className="max-w-6xl mx-auto px-5 py-10 ">
                <PanduanHeading/>
                <PanduanList/>
                <PanduanSupport/>
            </div>
            </div>
            <Footer/>
        </>
    )
}
