import type { ScriptEvent, ScriptNode } from "../../engine/VisualScript";
import { ActionNodeCard } from "./ActionNodeCard";
import { LogicNodeCard } from "./LogicNodeCard";

interface Props {
    node: ScriptNode;
    selectedId: string;
    onSelect: (id: string) => void;
    event: ScriptEvent;
    update: () => void;
    refresh: number;
}

const NodeRenderer = (props: Props) => {
    // Sprawdzamy czy node ma dzieci LUB czy jest typu 'logic'
    // Możesz tu też sprawdzać po prostu props.node.type === "logic"
    const isLogicBlock = props.node.type === "logic" || props.node.children !== undefined;

    if (isLogicBlock) {
        return (
            <LogicNodeCard 
                refresh={props.refresh}
                update={props.update}
                event={props.event}
                node={props.node}
                isSelected={props.selectedId === props.node.id}
                onClick={props.onSelect}
                onNodeSelect={props.onSelect} // Przekazujemy dalej do rekurencji
            />
        );
    }

    return (
        <ActionNodeCard 
            node={props.node}
            isSelected={props.selectedId === props.node.id}
            // isLast nie jest tu krytyczne w drzewie, można pominąć lub obliczyć
            isLast={false} 
            onClick={() => props.onSelect(props.node.id)}
        />
    );
};

export default NodeRenderer;