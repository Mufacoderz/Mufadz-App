import DoaListCard from "../../../components/public/Doa/DoaListCard"
import HeadingPage from "../../../components/public/Heading"

export default function DoaList() {
    return (
        <div className="dark:bg-gray-900 min-h-screen">
            <div className="py-10 px-2 sm:px-4 w-full max-w-5xl mx-auto">
                <HeadingPage title="Daftar Doa" subtitle="Kumpulan doa-doa pilihan sehari-hari" />
                <DoaListCard />
            </div>
        </div>
    )
}
