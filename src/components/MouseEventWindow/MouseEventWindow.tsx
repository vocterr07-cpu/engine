import { Show } from "solid-js"
import { state } from "../../engine/store"
import MouseEventCloseButton from "./MouseEventCloseButton"
import MouseEventList from "./MouseEventList"

const MouseEventWindow = () => {

    return (
        <div class="flex flex-col bg-zinc-900 h-full w-full">
            <Show when={state.selectedMouseEvent} fallback={<></>}>
                {(mouseEvent) => (
                    <>
                        <div class="flex items-center justify-between px-6 w-full h-12 border-b border-zinc-600">
                            <h1 class="tracking-[0.1em] font-black text-blue-500 text-xs">{mouseEvent().name}</h1>
                            <MouseEventCloseButton />
                        </div>
                        <MouseEventList mouseEvent={mouseEvent()}/>
                    </>

                )}
            </Show>
        </div>
    )
}

export default MouseEventWindow