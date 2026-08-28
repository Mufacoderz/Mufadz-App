interface HeaderPageProps {
    title: string
    subtitle?: string
}

export default function HeadingPage({ title, subtitle }: HeaderPageProps) {
    return (
        <header className="relative mb-8 text-center overflow-hidden">
            {/* Decorative background */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-blue-400/10 dark:bg-blue-500/5 rounded-full blur-3xl" />
            </div>

            <div className="py-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">
                    {title}
                </h2>
                {subtitle && (
                    <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
                        {subtitle}
                    </p>
                )}
                <div className="mt-3 mx-auto w-12 h-1 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 dark:from-blue-500 dark:to-blue-400" />
            </div>
        </header>
    )
}
