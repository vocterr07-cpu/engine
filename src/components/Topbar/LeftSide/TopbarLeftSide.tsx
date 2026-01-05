import { createSignal, Show, onCleanup, onMount } from "solid-js"
import LanguageModal from "../LanguageModal"
import FileMenuDropdown from "./MenuDropdowns/FileMenuDropdown"
import SettingsMenuDropdown from "./MenuDropdowns/SettingsMenuDropdown" // Import
import { ChevronDown } from "lucide-solid"

const TopbarLeftSide = () => {
    const [isLangOpen, setLangOpen] = createSignal(false);
    const [activeMenu, setActiveMenu] = createSignal<string | null>(null);

    const handleClickOutside = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (!target.closest('[data-menu-trigger]')) {
            setActiveMenu(null);
        }
    };

    onMount(() => window.addEventListener('click', handleClickOutside));
    onCleanup(() => window.removeEventListener('click', handleClickOutside));

    const toggleMenu = (menuName: string) => {
        setActiveMenu(activeMenu() === menuName ? null : menuName);
    }

    // Helper do generowania klas przycisku (zeby nie kopiowac kodu)
    const getBtnClass = (isActive: boolean) => `
        px-3 py-1.5 rounded-md transition-all ease-in-out duration-300 
        text-xs font-black uppercase tracking-widest flex items-center gap-1
        ${isActive 
            ? "bg-blue-600/20 text-blue-400" 
            : "text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"
        }
    `;

    return (
        <>
            <div class="flex items-center gap-1">
                {/* --- FILE MENU --- */}
                <div class="relative">
                    <button 
                        data-menu-trigger
                        onClick={() => toggleMenu("File")}
                        class={getBtnClass(activeMenu() === "File")}
                    >
                        File
                    </button>
                    <Show when={activeMenu() === "File"}>
                        <FileMenuDropdown/>
                    </Show>
                </div>

                {/* --- SETTINGS MENU --- */}
                <div class="relative">
                    <button 
                        data-menu-trigger
                        onClick={() => toggleMenu("Settings")}
                        class={getBtnClass(activeMenu() === "Settings")}
                    >
                        Settings
                    </button>
                    <Show when={activeMenu() === "Settings"}>
                        {/* Przekazujemy funkcję otwierania modala języka do środka */}
                        <SettingsMenuDropdown openLangModal={() => {
                            setLangOpen(true);
                            setActiveMenu(null); // Zamykamy menu po kliknięciu
                        }}/>
                    </Show>
                </div>
            </div>

            <Show when={isLangOpen()}>
                <LanguageModal langOpen={isLangOpen()} setLangOpen={setLangOpen} />
            </Show>
        </>
    )
}

export default TopbarLeftSide