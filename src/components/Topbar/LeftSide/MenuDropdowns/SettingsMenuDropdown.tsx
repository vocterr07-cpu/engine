import { Languages, Monitor, Keyboard, Settings2 } from 'lucide-solid'
import { MenuContainer, MenuHeader, MenuItem, MenuSeparator } from '../MenuUI'

interface Props {
    setModalOpened: (modalName: string) => void;
    setActiveMenu: (menuName: string | null) => void;
}

const SettingsMenuDropdown = (props: Props) => {
    return (
        <MenuContainer>
            <MenuHeader title="General" />

            <MenuItem
                label='Game Properties'
                icon={Settings2}
                onClick={() => props.setModalOpened("GameProperties")}
            />

            <MenuItem 
                label="Language" 
                icon={Languages} 
                onClick={() => props.setModalOpened("Language")}
            />

            <MenuItem 
                label="Theme" 
                icon={Monitor} 
                disabled 
                shortcut="Coming Soon"
            />
            
            <MenuSeparator />
            <MenuHeader title="Editor" />

            <MenuItem 
                label="Keybindings" 
                icon={Keyboard} 
                onClick={() => alert("Skróty klawiszowe")} 
            />
        </MenuContainer>
    )
}

export default SettingsMenuDropdown