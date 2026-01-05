
import './App.css'
import Console from './components/Console/Console';
import ScriptEditor from './components/ScriptEditor/ScriptEditor';
import Sidebar from './components/Sidebar/Sidebar';
import Topbar from './components/Topbar/Topbar';
import Engine from './engine/Engine';
import { state, storeActions } from './engine/store';
import { onCleanup, onMount, Show } from 'solid-js';
import EditMode from './components/EditMode/EditMode';
import MouseEventWindow from './components/MouseEventWindow/MouseEventWindow';
import TouchEventWindow from './components/TouchEventWindow/TouchEventWindow';
import GlobalVariablesWindow from './components/GlobalVariables/GlobalVariablesWindow';
import ParticleSystemWindow from './components/ParticleSystemWindow/ParticleSystemWindow';
import VisualScriptWindow from './components/VisualScripting/VisualScriptWindow';

function App() {
  let canvas: HTMLCanvasElement | undefined;
  let engine: Engine | null = null;
  onMount(() => {
    if (canvas) {
      engine = new Engine(canvas);
      storeActions.setEngine(engine);
      engine.start();

      onCleanup(() => {
        if (engine) {
          engine.destroy();
        engine = null;
        }
        
      })
    }
  })


  return (
    // h-screen i flex-col są super, to trzyma Topbar na górze
    <main class='flex flex-col h-screen  fixed top-0 left-0 w-screen bg-zinc-950'>
      <Topbar />
      
      <div class='flex flex-1 overflow-hidden items-stretch'>

        <div class='flex flex-col flex-1 min-w-0'>
          <div class="flex-1 min-h-0 relative bg-black">
            <canvas
              ref={canvas}
              class='w-full h-full'
              classList={{
                "hidden": state.openedWindow !== "",
                "block": state.openedWindow === ""
              }}
            />
            <Show when={state.selectedObject && state.openedWindow === ""} fallback={<></>}>
              {(obj) => (
                <EditMode/>
              )}
            </Show>
            <Show when={state.openedWindow === "globalVariables"}>
              <GlobalVariablesWindow/>
            </Show>
            <Show when={state.openedWindow === "visualScript"}>
              <VisualScriptWindow/>
            </Show>
            <Show when={state.openedWindow === "script"} fallback={<></>}>
              <ScriptEditor />
            </Show>
            <Show when={state.openedWindow === "mouseEvent"} fallback={<></>}>
              <MouseEventWindow/>
            </Show>
            <Show when={state.openedWindow === "touchEvent"} fallback={<></>}>
              <TouchEventWindow/>
            </Show>
            <Show when={state.openedWindow === "particleSystem"}>
              <ParticleSystemWindow/>
            </Show>
          </div>
          <Console />
        </div>

        <Sidebar />
      </div>
    </main>
  );
}
export default App;