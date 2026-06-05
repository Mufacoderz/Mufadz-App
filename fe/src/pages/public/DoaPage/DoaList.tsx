
import DoaListCard from "../../../components/public/Doa/DoaListCard"
import HeadingPage from "../../../components/public/Heading"
import Footer from "../../../components/public/Footer"

export default function DoaList() {
    

    return (
        <>
            <section className=" px-5 py-10 dark:bg-gray-900 h-full">

                <div className="max-w-3xl mx-auto">
                    <HeadingPage title="Daftar Doa" />
                    <DoaListCard />
                </div>

            </section>
            <Footer />
        </>
    )
}