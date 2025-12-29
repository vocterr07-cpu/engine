import { Play } from 'lucide-solid'
import { state } from '../../../engine/store'

const PlayButton = () => {

    const handleClick = () => {
        state.mode = "player";
    }
  return (
     <button onClick={handleClick}><Play/></button>
  )
}

export default PlayButton