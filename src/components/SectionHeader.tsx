import type { LucideProps } from "lucide-solid";
import type { Component } from "solid-js";

interface Props {
    icon: Component<LucideProps>;
    label: string;
}
const SectionHeader = (props: Props) => {
    return (
        <div class="flex items-center justify-between text-zinc-500">
            <h1 class="uppercase font-black text-xs tracking-[0.15em] select-none border-l-2 border-blue-600 pl-2">{props.label}</h1>
            <props.icon size={20} />
        </div>
    )
}

export default SectionHeader