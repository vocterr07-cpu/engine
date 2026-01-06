import { createSignal, createEffect, onCleanup, Show } from "solid-js";
import Console from "../Console/Console";
import AssetBrowser from "../AssetManager/AssetBrowser";
import { Terminal, FolderOpen, X } from "lucide-solid";

const BottomPanel = () => {
    // Stan panelu
    const [activeTab, setActiveTab] = createSignal<"console" | "assets">("console");
    const [height, setHeight] = createSignal(250);
    const [isResizing, setIsResizing] = createSignal(false);
    const [isVisible, setIsVisible] = createSignal(true);

    // --- LOGIKA RESIZINGU (Przeniesiona tutaj, żeby była wspólna) ---
    const handleMouseMove = (e: MouseEvent) => {
        if (!isResizing()) return;
        const newHeight = window.innerHeight - e.clientY;
        // Ograniczenia: min 100px, max 80% ekranu
        if (newHeight > 30 && newHeight < window.innerHeight * 0.8) setHeight(newHeight);
    };

    const stopResizing = () => setIsResizing(false);

    createEffect(() => {
        if (isResizing()) {
            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("mouseup", stopResizing);
            onCleanup(() => {
                window.removeEventListener("mousemove", handleMouseMove);
                window.removeEventListener("mouseup", stopResizing);
            });
        }
    });

    if (!isVisible()) {
        // Mały przycisk do przywrócenia panelu, jeśli go zamkniesz (opcjonalne)
        return (
            <button 
                onClick={() => setIsVisible(true)}
                class="absolute bottom-0 right-0 bg-[#007acc] text-white px-2 py-1 text-xs z-50 flex items-center gap-2"
            >
                <Terminal size={12} /> Panel
            </button>
        )
    }

    return (
        <div 
            class="flex flex-col relative shrink-0 w-full bg-[#1e1e1e] border-t border-[#333333] shadow-2xl z-40"
            style={{ height: `${height()}px` }}
        >
            {/* Uchwyt do zmiany rozmiaru */}
            <div 
                onMouseDown={() => setIsResizing(true)}
                class="absolute -top-1 left-0 w-full h-2 cursor-ns-resize z-50 hover:bg-blue-600/50 transition-colors"
                classList={{ "bg-blue-600": isResizing() }}
            />

            {/* Header / Pasek Zakładek */}
            <div class="flex items-center justify-between px-2 bg-[#252526] border-b border-[#333333] shrink-0 h-[30px]">
                <div class="flex h-full">
                    {/* Tab: Console */}
                    <button 
                        onClick={() => setActiveTab("console")}
                        class={`flex items-center gap-2 px-3 text-[11px] uppercase tracking-wider border-r border-[#333333] hover:bg-[#2d2d2d] transition-colors h-full
                            ${activeTab() === "console" ? "text-white bg-[#1e1e1e] border-t-2 border-t-blue-500" : "text-zinc-500 border-t-2 border-t-transparent"}`}
                    >
                        <Terminal size={12} /> Console
                    </button>

                    {/* Tab: Assets */}
                    <button 
                        onClick={() => setActiveTab("assets")}
                        class={`flex items-center gap-2 px-3 text-[11px] uppercase tracking-wider border-r border-[#333333] hover:bg-[#2d2d2d] transition-colors h-full
                            ${activeTab() === "assets" ? "text-white bg-[#1e1e1e] border-t-2 border-t-blue-500" : "text-zinc-500 border-t-2 border-t-transparent"}`}
                    >
                        <FolderOpen size={12} /> Assets
                    </button>
                </div>

                {/* Zamknij panel */}
                <button onClick={() => setIsVisible(false)} class="text-zinc-500 hover:text-white p-1">
                    <X size={14} />
                </button>
            </div>

            {/* Content Area */}
            <div class="flex-1 overflow-hidden relative">
                <Show when={activeTab() === "console"}>
                    <Console />
                </Show>
                <Show when={activeTab() === "assets"}>
                    <AssetBrowser />
                </Show>
            </div>
        </div>
    );
};

export default BottomPanel;