import { createEffect, For, Show } from "solid-js";
import { state, storeActions } from "../../engine/store";
import NoOutputYet from "./NoOutputYet";
import { Trash, AlertCircle, Info } from "lucide-solid";

const Console = () => {
  let scrollContainer: HTMLDivElement | undefined;
  let isUserScrolledUp = false;

  const handleScroll = (e: Event) => {
    const target = e.target as HTMLDivElement;
    const isAtBottom = target.scrollHeight - target.scrollTop - target.clientHeight <= 5;
    isUserScrolledUp = !isAtBottom;
  };

  createEffect(() => {
    state.logs.length;
    if (scrollContainer && !isUserScrolledUp) {
      requestAnimationFrame(() => {
        scrollContainer!.scrollTop = scrollContainer!.scrollHeight;
      });
    }
  });

  const getLogColor = (type: string) => {
    switch (type) {
      case 'error': return 'text-red-400 bg-red-900/10 border-red-900/30';
      case 'warn': return 'text-yellow-400 bg-yellow-900/10 border-yellow-900/30';
      default: return 'text-zinc-300 border-zinc-900/50';
    }
  };

  // Zwracamy samą zawartość, wysokość ustala rodzic (BottomPanel)
  return (
    <div class="flex flex-col w-full h-full bg-[#1e1e1e]">

      {/* Pasek narzędzi konsoli (Clear) */}
      <div class="flex items-center justify-between px-4">
        <h1 class="text-[10px] font-bold uppercase tracking-[0.07em] text-zinc-500">Console</h1>
        <div class="flex items-center justify-end  py-1 bg-[#1e1e1e] border-b border-[#333333] shrink-0">
          <button
            onclick={() => storeActions.clearLogs()}
            class="flex items-center gap-1.5 px-2 py-0.5 rounded hover:bg-[#333333] text-zinc-500 hover:text-red-400 transition-colors"
            title="Wyczyść logi"
          >
            <Trash size={12} />
            <span class="text-[10px] font-bold uppercase">Clear</span>
          </button>
        </div>
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
                  <Show when={log.type === 'error'}><AlertCircle size={12} class="mt-[2px] shrink-0" /></Show>
                  <Show when={log.type === 'warn'}><Info size={12} class="mt-[2px] shrink-0" /></Show>
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