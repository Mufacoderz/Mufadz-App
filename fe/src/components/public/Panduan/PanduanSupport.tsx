const PanduanSupport = () => {
    return (
        <div className="flex items-center justify-between gap-4 flex-wrap bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-5 mb-12">
            <div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">
                    Butuh bantuan lebih lanjut?
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Saya siap membantu jika ada pertanyaan atau kendala.
                </p>
            </div>
            
            <a href="https://github.com/Mufacoderz"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all whitespace-nowrap"
                >
                Hubungi Support
            </a>
        </div>
    )
}

export default PanduanSupport