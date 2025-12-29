import { createSignal, createEffect, onCleanup, For, Show } from "solid-js";
import { state, storeActions } from "../../engine/store"
import NoOutputYet from "./NoOutputYet";
import {Terminal, Trash} from "lucide-solid"

const Console = () => {
  // 1. Sygnały do kontroli wymiarów i stanu
  const [height, setHeight] = createSignal(200); // początkowa wysokość
  const [isResizing, setIsResizing] = createSignal(false);

  // 2. Logika obliczania wysokości
  // Ponieważ konsola jest na dole, wysokość = wysokość okna - pozycja Y myszy
  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing()) return;
    const newHeight = window.innerHeight - e.clientY;
    
    // Limitujemy wysokość (min 100px, max 80% ekranu)
    if (newHeight > 100 && newHeight < window.innerHeight * 0.8) {
      setHeight(newHeight);
    }
  };

  const stopResizing = () => setIsResizing(false);

  // 3. Magiczny Bridge: createEffect + onCleanup
  createEffect(() => {
    if (isResizing()) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", stopResizing);

      // Solid posprząta to automatycznie, gdy isResizing zmieni się na false 
      // lub gdy komponent zostanie usunięty
      onCleanup(() => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", stopResizing);
      });
    }
  });

  return (
    <div 
      class="flex flex-col relative shrink-0 w-full bg-zinc-950 border-t border-zinc-700"
      style={{ height: `${height()}px` }} // Reaktywne przypisanie wysokości
    >
      {/* 4. Resizer Handle (Twoja czerwona linia, teraz funkcjonalna) */}
      <div 
        onMouseDown={() => setIsResizing(true)}
        class="absolute -top-1 left-0 w-full h-2 cursor-ns-resize z-50 hover:bg-blue-600/50 transition-colors"
        classList={{ "bg-blue-600": isResizing() }}
      />

      <div class="p-2 flex flex-col h-full overflow-hidden">
        <div class="flex items-center justify-between mb-2 shrink-0">
          <div class="flex items-center gap-1">
            <Terminal size={16} class="text-zinc-500 relative top-[1px]"/>
            <h1 class="text-[10px] font-black text-zinc-500 tracking-[0.15em] uppercase">Console</h1>
          </div>
          <div onclick={() => storeActions.clearLogs()} class="flex gap-1 hover:text-white text-zinc-600">
            <Trash size={14}/>
            <button class="text-[10px]   uppercase font-bold">Clear</button>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto font-mono text-[11px]">
          <Show 
            when={state.logs.length > 0} 
            fallback={<NoOutputYet />}
          >
            <For each={state.logs}>
              {(log) => (
                <div class="flex gap-2 py-0.5 border-b border-zinc-900/50">
                  <span class="text-zinc-600 shrink-0">[{log.timestamp}]</span>
                  <span class="text-zinc-300">{log.message}</span>
                </div>
              )}
            </For>
          </Show>
        </div>
      </div>
    </div>
  );
};

export default Console;