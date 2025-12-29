import { createSignal, createEffect, onCleanup, For, Show } from "solid-js";
import { state, storeActions } from "../../engine/store";
import NoOutputYet from "./NoOutputYet";
import { Terminal, Trash, AlertCircle, Info } from "lucide-solid";

const Console = () => {
  const [height, setHeight] = createSignal(200);
  const [isResizing, setIsResizing] = createSignal(false);
  let scrollContainer: HTMLDivElement | undefined;
  let isUserScrolledUp = false; // Flaga: czy user przewinął do góry?

  // --- Resize Logic (Bez zmian, jest OK) ---
  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing()) return;
    const newHeight = window.innerHeight - e.clientY;
    if (newHeight > 100 && newHeight < window.innerHeight * 0.8) setHeight(newHeight);
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

  // --- Inteligentny Auto-Scroll ---
  // Wykrywaj, czy user przewinął do góry ręcznie
  const handleScroll = (e: Event) => {
    const target = e.target as HTMLDivElement;
    // Margines błędu 5px
    const isAtBottom = target.scrollHeight - target.scrollTop - target.clientHeight <= 5;
    isUserScrolledUp = !isAtBottom;
  };

  // Gdy dojdą nowe logi, przewiń na dół TYLKO jeśli user nie czyta historii
  createEffect(() => {
    state.logs.length; // Subskrypcja zmian
    if (scrollContainer && !isUserScrolledUp) {
      // requestAnimationFrame zapewnia, że scroll nastąpi PO renderowaniu DOM
      requestAnimationFrame(() => {
        scrollContainer!.scrollTop = scrollContainer!.scrollHeight;
      });
    }
  });

  // Pomocnik do kolorów
  const getLogColor = (type: string) => {
    switch (type) {
      case 'error': return 'text-red-400 bg-red-900/10 border-red-900/30';
      case 'warn': return 'text-yellow-400 bg-yellow-900/10 border-yellow-900/30';
      default: return 'text-zinc-300 border-zinc-900/50';
    }
  };

  return (
    <div 
      class="flex flex-col relative shrink-0 w-full bg-[#1e1e1e] border-t border-[#333333] shadow-xl"
      style={{ height: `${height()}px` }}
    >
      <div 
        onMouseDown={() => setIsResizing(true)}
        class="absolute -top-1 left-0 w-full h-2 cursor-ns-resize z-50 hover:bg-blue-600/50 transition-colors"
        classList={{ "bg-blue-600": isResizing() }}
      />

      {/* Header */}
      <div class="flex items-center justify-between px-3 py-1.5 bg-[#252526] border-b border-[#333333] shrink-0">
        <div class="flex items-center gap-2">
          <Terminal size={14} class="text-zinc-400"/>
          <h1 class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Debug Console</h1>
          <span class="text-[10px] text-zinc-600 ml-2">buffer: {state.logs.length}/500</span>
        </div>
        <button 
          onclick={() => storeActions.clearLogs()} 
          class="flex items-center gap-1.5 px-2 py-0.5 rounded hover:bg-[#333333] text-zinc-400 hover:text-white transition-colors"
        >
          <Trash size={12}/>
          <span class="text-[10px] font-bold uppercase">Clear</span>
        </button>
      </div>

      {/* Log List */}
      <div 
        ref={scrollContainer}
        onScroll={handleScroll}
        class="flex-1 overflow-y-auto font-mono text-[12px] p-2 space-y-[1px]"
      >
        <Show when={state.logs.length > 0} fallback={<NoOutputYet />}>
          <For each={state.logs}>
            {(log) => (
              <div class={`flex gap-3 px-2 py-1 border-b border-dashed leading-tight ${getLogColor(log.type)}`}>
                <span class="text-zinc-500 shrink-0 select-none w-[70px] text-[10px] pt-[2px] opacity-70">
                    {log.timestamp}
                </span>
                
                <div class="break-all whitespace-pre-wrap flex-1 flex gap-2">
                    <Show when={log.type === 'error'}><AlertCircle size={12} class="mt-[2px] shrink-0"/></Show>
                    <Show when={log.type === 'warn'}><Info size={12} class="mt-[2px] shrink-0"/></Show>
                    <span>{log.message}</span>
                </div>
              </div>
            )}
          </For>
        </Show>
      </div>
    </div>
  );
};

export default Console;