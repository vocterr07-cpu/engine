
import {Terminal} from "lucide-solid"

const NoOutputYet = () => {
  return (
    <div class="position absolute top-1/2 left-1/2 translate-x-[-50%] text-zinc-600 translate-y-[-50%] items-center flex flex-col gap-1">
        <Terminal size={50}/>
        <h1 class=" tracking-[0.1em] font-bold text-sm">No Output Yet...</h1>
    </div>
  )
}

export default NoOutputYet