import { StopCircle } from 'lucide-solid'
import { state } from '../../../engine/store';

const StopButton = () => {
    const handleClick = () => {
            state.mode = "camera";
            state.gameStarted = false;
        }
  return (
    <button onClick={handleClick}><StopCircle/></button>
  )
}

export default StopButton