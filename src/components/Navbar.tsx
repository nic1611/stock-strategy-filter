export const Navbar = () => {
    return (
        <nav className="flex items-center gap-2">
            <a href="#" className="px-4 py-1.5 bg-[#333333] text-gray-200 rounded-md text-sm font-medium hover:bg-[#404040] transition-colors border border-[#404040]">
                Dashboard
            </a>
            <a href="#" className="px-4 py-1.5 text-gray-400 hover:text-white text-sm font-medium transition-colors">
                About
            </a>
            <a href="#" className="px-4 py-1.5 text-gray-400 hover:text-white text-sm font-medium transition-colors">
                Contact
            </a>
        </nav>
    );
};
