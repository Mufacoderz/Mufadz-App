import { Menu, X } from "lucide-react"

interface SidebarToggleProps {
    open: boolean
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const SidebarToggle: React.FC<SidebarToggleProps> = ({ open, setOpen }) => {
    return (
        <button
            onClick={() => setOpen(!open)}
            className={`md:hidden fixed top-4 z-50 dark:text-white bg-transparent  p-2 rounded-lg border-none transition-all duration-500 
                left-4 hover:text-blue-600 dark:hover:text-blue-300 hover:cursor-pointer
                ${open ? 'hover:rotate-[360deg]' : 'hover:rotate-0'}`}
        >
            {open ? <X size={24} /> : <Menu size={24} />}
        </button>
    )
}

export default SidebarToggle
