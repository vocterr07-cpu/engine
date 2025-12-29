import { onCleanup, onMount, createEffect } from "solid-js";
import loader from "@monaco-editor/loader";
import { X, Save } from "lucide-solid";
import { state, storeActions } from "../../engine/store";

const ScriptEditor = () => {
  let containerRef: HTMLDivElement | undefined;
  let editorInstance: any;
  let monacoInstance: any;

  // --- KLUCZOWA ZMIANA: Reakcja na zmianę skryptu ---
  createEffect(() => {
    const script = state.selectedScript;
    // Jeśli edytor jest już stworzony i mamy wybrany skrypt
    if (editorInstance && script) {
      // getValue() zapobiega resetowaniu kursora, jeśli treść jest identyczna
      if (editorInstance.getValue() !== script.sourceCode) {
        editorInstance.setValue(script.sourceCode);
      }
    }
  });

  onMount(() => {
    loader.init().then((monaco) => {
      if (!containerRef) return;
      monacoInstance = monaco;

      editorInstance = monaco.editor.create(containerRef, {
        value: state.selectedScript?.sourceCode || "",
        language: "javascript", // Możesz użyć "javascript", żeby TS nie krzyczał o brakujących typach klas
        theme: "vs-dark",
        automaticLayout: true,
        minimap: { enabled: false },
        fontSize: 13,
        fontFamily: "'JetBrains Mono', monospace",
      });

      editorInstance.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
        handleSave();
      });
    });
  });

  onCleanup(() => {
    if (editorInstance) editorInstance.dispose();
  });

  const handleSave = () => {
    const code = editorInstance?.getValue();
    const script = state.selectedScript;
    if (!script || code === undefined) return;
    
    // Zapisujemy do obiektu
    script.sourceCode = code;
    // Kompilujemy
    script.compile();
  };

  const handleClose = () => {
    storeActions.setOpenedWindow("");
    storeActions.setSelectedComponent(null);
  };

  return (
    <div class="flex flex-col w-full h-full bg-[#1e1e1e]">
      <div class="flex items-center justify-between h-10 px-4 bg-[#2d2d2d] border-b border-zinc-700 shrink-0">
        <div class="flex items-center gap-2">
            <span class="text-xs font-bold text-blue-400 uppercase tracking-widest">
                {state.selectedScript?.name || "No Script"}
            </span>
        </div>
        
        <div class="flex items-center gap-2">
            <button onClick={handleSave} class="p-1 hover:bg-white/10 rounded text-zinc-400 hover:text-white transition-colors">
                <Save size={16} />
            </button>
            <div class="w-[1px] h-4 bg-zinc-600 mx-1"></div>
            <button onClick={handleClose} class="p-1 hover:bg-red-500/20 rounded text-zinc-400 hover:text-red-400 transition-colors">
                <X size={16} />
            </button>
        </div>
      </div>
      <div ref={containerRef} class="flex-1 w-full min-h-0 relative text-left" />
    </div>
  );
};

export default ScriptEditor;