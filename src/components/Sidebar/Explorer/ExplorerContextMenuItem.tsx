
interface Props {
    label: string;
    handleClick: () => void;
}
const ExplorerContextMenuItem = (props: Props) => {
  return (
    <button onClick={props.handleClick} class="pl-5 text-sm font-semibold text-zinc-300 transition-colors py-1 hover:bg-blue-600 w-full rounded-md text-left">{props.label}</button>
  )
}

export default ExplorerContextMenuItem