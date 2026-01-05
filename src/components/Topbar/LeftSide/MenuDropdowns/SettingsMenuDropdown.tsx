import { Languages, Monitor, Keyboard } from 'lucide-solid'
import { MenuContainer, MenuHeader, MenuItem, MenuSeparator } from '../MenuUI'

interface Props {
    openLangModal: () => void; // Przekazujemy funkcję do otwierania modala
}

const SettingsMenuDropdown = (props: Props) => {
    return (
        <MenuContainer>
            <MenuHeader title="General" />

            <MenuItem 
                label="Language" 
                icon={Languages} 
                onClick={props.openLangModal}
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