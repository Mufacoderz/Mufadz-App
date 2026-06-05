type NumberProps = {
    nomor: number
}

function Number({ nomor }: NumberProps) {
    return (
        <div
            className="
    w-8 h-8 min-w-[2.5rem] min-h-[2.5rem]
    rounded-full flex items-center justify-center
    text-white dark:text-gray-700
    bg-textLight dark:bg-textDark"
        >
            {nomor}
        </div>

    )
}

export default Number