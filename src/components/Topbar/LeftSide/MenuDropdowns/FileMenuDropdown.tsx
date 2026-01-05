import { FolderOpen, Save, FileJson } from 'lucide-solid'
import ImportOBJButton from '../../ImportOBJButton'
import { MenuContainer, MenuHeader, MenuItem, MenuSeparator } from '../MenuUI'


const FileMenuDropdown = () => {
    return (
        <MenuContainer>
            <MenuHeader title="Project" />

            <MenuItem 
                label="Open Project" 
                icon={FolderOpen} 
                onClick={() => console.log("Open")} 
            />
            
            <MenuItem 
                label="Save Project" 
                icon={Save} 
                shortcut="Ctrl+S"
                onClick={() => console.log("Save")} 
            />

            <MenuSeparator />

            <MenuHeader title="Import" />
            
            <ImportOBJButton />

            <MenuItem 
                label="Import Texture" 
                icon={FileJson} 
                disabled={true} 
            />
        </MenuContainer>
    )
}

export default FileMenuDropdown