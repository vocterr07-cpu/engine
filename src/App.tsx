
import { unwrap } from 'solid-js/store';
import './App.css'
import Console from './components/Console/Console';
import ScriptEditor from './components/ScriptEditor/ScriptEditor';
import Sidebar from './components/Sidebar/Sidebar';
import Topbar from './components/Topbar/Topbar';
import Engine from './engine/Engine';
import { state, storeActions } from './engine/store';
import { onMount, Show } from 'solid-js';

function App() {
  let canvas: HTMLCanvasElement | undefined;

  onMount(() => {
    if (canvas) {
      const engine = new Engine(canvas);
      storeActions.setEngine(engine);
      engine.start();
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
            <Show when={state.openedWindow === "script"} fallback={<></>}>
              <ScriptEditor />
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