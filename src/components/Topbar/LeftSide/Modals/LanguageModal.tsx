import { createSignal, For } from "solid-js"
import { state } from "../../../../engine/store";
import { Search, X } from "lucide-solid";


const LanguageModal = ({
    isOpened,
    setModalOpened
} : {
    isOpened: boolean,
    setModalOpened: (modalName: string) => void
}) => {
    const [searchQuery, setSearchQuery] = createSignal("");

    const AVAILABLE_LANGUAGES = [
        { code: "en", name: "English", flag: "🇺🇸", native: "English" },
        { code: "pl", name: "Polish", flag: "🇵🇱", native: "Polski" },
        { code: "de", name: "German", flag: "🇩🇪", native: "Deutsch" },
        { code: "fr", name: "French", flag: "🇫🇷", native: "Français" },
        { code: "es", name: "Spanish", flag: "🇪🇸", native: "Español" },
        { code: "it", name: "Italian", flag: "🇮🇹", native: "Italiano" },
        { code: "pt", name: "Portuguese", flag: "🇵🇹", native: "Português" },
        { code: "ru", name: "Russian", flag: "🇷🇺", native: "Русский" },
        { code: "ja", name: "Japanese", flag: "🇯🇵", native: "日本語" },
        { code: "ko", name: "Korean", flag: "🇰🇷", native: "한국어" },
        { code: "zh", name: "Chinese", flag: "🇨🇳", native: "中文" },
        { code: "uk", name: "Ukrainian", flag: "🇺🇦", native: "Українська" },
    ];

    const filteredLangs = () => AVAILABLE_LANGUAGES.filter(l =>
        l.name.toLowerCase().includes(searchQuery().toLowerCase()) ||
        l.native.toLowerCase().includes(searchQuery().toLowerCase())
    );

    const changeLanguage = (code: string) => {
        state.language = code;
        setModalOpened("");
    }
    return (

        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">

            {/* Kliknięcie w tło zamyka modal */}
            <div class="absolute inset-0" onClick={() => setModalOpened("")}></div>

            {/* Okno Modala */}
            <div class="relative bg-zinc-900 border border-zinc-700 w-[600px] max-h-[80vh] rounded-xl shadow-2xl shadow-black flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header Modala */}
                <div class="flex items-center justify-between p-5 border-b border-zinc-800 bg-zinc-900/50">
                    <div>
                        <h2 class="text-lg font-black text-white tracking-wide">SELECT LANGUAGE</h2>
                        <p class="text-xs text-zinc-500">Choose your preferred interface language</p>
                    </div>
                    <button onClick={() => setModalOpened("")} class="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Search Bar */}
                <div class="p-4 bg-zinc-900/30">
                    <div class="relative">
                        <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                        <input
                            type="text"
                            placeholder="Search language..."
                            value={searchQuery()}
                            onInput={(e) => setSearchQuery(e.currentTarget.value)}
                            class="w-full bg-zinc-950 border border-zinc-700 text-zinc-200 text-sm rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        />
                    </div>
                </div>

                {/* Lista Języków (Grid) */}
                <div class="p-5 overflow-y-auto custom-scrollbar">
                    <div class="grid grid-cols-2 gap-3">
                        <For each={filteredLangs()} fallback={
                            <div class="col-span-2 text-center py-8 text-zinc-500 italic">No language found.</div>
                        }>
                            {(lang) => (
                                <button
                                    onClick={() => changeLanguage(lang.code)}
                                    class="flex items-center gap-3 p-3 rounded-lg border border-zinc-800 bg-zinc-800/50 hover:bg-zinc-800 hover:border-zinc-600 transition-all group text-left"
                                >
                                    <span class="text-2xl filter grayscale group-hover:grayscale-0 transition-all">{lang.flag}</span>
                                    <div class="flex flex-col">
                                        <span class="text-sm font-bold text-zinc-300 group-hover:text-white">{lang.native}</span>
                                        <span class="text-[10px] text-zinc-500 font-mono uppercase tracking-wider group-hover:text-zinc-400">{lang.name}</span>
                                    </div>
                                    {/* Oznaczenie aktualnego języka (przykład dla 'en') */}
                                    {state.language === lang.code && ( // Zakładając, że masz language w state
                                        <div class="ml-auto w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                                    )}
                                </button>
                            )}
                        </For>
                    </div>
                </div>

                {/* Footer */}
                <div class="p-3 bg-zinc-950/50 border-t border-zinc-800 text-center">
                    <p class="text-[10px] text-zinc-600">Translation contributions are welcome on our GitHub.</p>
                </div>
            </div>
        </div>
    )
}

export default LanguageModal