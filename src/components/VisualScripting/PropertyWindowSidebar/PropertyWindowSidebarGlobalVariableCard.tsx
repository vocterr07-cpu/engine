
import type { GameVariable } from '../../../engine/store'
import type { JSXElement } from 'solid-js';

interface Props {
    variable: GameVariable;
    getTypeIcon: (type: string) => JSXElement;
    onVariableClick: (id: string) => void
}

const PropertyWindowSidebarGlobalVariableCard = (props: Props) => {
    
  return (
    <div onClick={() => props.onVariableClick(props.variable.id )} class="group/var cursor-pointer flex items-center justify-between p-2 rounded-lg bg-zinc-900/50 border border-zinc-800/50 hover:bg-zinc-900 hover:border-orange-500/30 transition-all duration-200">
                                
                                <div class="flex items-center gap-3 overflow-hidden">
                                    {/* Type Badge */}
                                    <div class="flex items-center gap-1 px-1.5 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-500 group-hover/var:text-orange-400 group-hover/var:border-orange-500/20 transition-colors">
                                        {props.getTypeIcon(props.variable.type)}
                                        <span class="text-[9px] font-black font-mono uppercase">{props.variable.type === "Boolean" ? props.variable.type.slice(0, 4) : props.variable.type.slice(0, 3)}</span>
                                    </div>
                                    
                                    {/* props.variable Name */}
                                    <span class="text-zinc-400 font-mono text-xs font-bold group-hover/var:text-zinc-200 transition-colors truncate">
                                        {props.variable.name}
                                    </span>
                                </div>

                                {/* Value Badge */}
                                <div class="flex items-center px-2 py-1 rounded-md bg-black/40 border border-zinc-800 group-hover/var:border-orange-500/10 transition-all">
                                    <span class={`text-xs font-mono font-bold ${
                                        props.variable.type === 'Boolean' 
                                            ? (props.variable.value === 'true' || props.variable.value === true ? 'text-emerald-500' : 'text-red-500')
                                            : 'text-orange-400/90'
                                    }`}>
                                        {String(props.variable.value)}
                                    </span>
                                </div>

                            </div>
  )
}

export default PropertyWindowSidebarGlobalVariableCard