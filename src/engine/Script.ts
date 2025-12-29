import Component from "./Component";


export default class Script extends Component {
    public sourceCode: string = "";
    private instance: any = null;
    private isInitialized: boolean = false;

    constructor(name: string) {
        super(name);
        this.sourceCode = `
        class MyScript {
    gameObject; 
    lastLogTime;

    start() {
        console.log("Start!", this.gameObject.name);
        this.lastLogTime = 0;
    }

    update() {
        const now = Date.now();
        if (now - this.lastLogTime > 1000) {
            console.log("Status: ", this.gameObject.position);
            this.lastLogTime = now;
        }
    }
}
`;
    }

    public compile() {
    if (!this.gameObject) return;
    try {
        const apiWrapper = `
            const getPlayer = () => {
                return system.gameObject.scene?.getPlayer();
            };

            const getObject = () => {
                return system.gameObject;
            }
                return (
                    ${this.sourceCode}
                )
            
        `;

        // Tworzymy funkcję, która oczekuje argumentu o nazwie "system"
        const createClass = new Function("system", apiWrapper);
        
        // --- TUTAJ BYŁ BŁĄD ---
        // Musisz przekazać 'this', żeby 'system' w środku nie był undefined
        const ClassDef = createClass(this); 
        
        if (typeof ClassDef !== 'function') {
            throw new Error("Skrypt musi zwracać klasę!");
        }

        this.instance = new ClassDef();
        this.instance.gameObject = this.gameObject;

        // Bindowanie (żeby 'this' w skrypcie użytkownika zawsze działało)
        if (this.instance.start) {
            this.instance.start = this.instance.start.bind(this.instance);
        }
        
        if (this.instance.update) {
            this.instance.update = this.instance.update.bind(this.instance);
        }

        if (this.instance.start) this.instance.start();
        this.isInitialized = true;
    } catch (e) {
        console.error(`Błąd w skrypcie ${this.name}:`, e);
    }
}

    public update() {
        if (this.isInitialized && this.instance && this.instance.update) {
            try {
                this.instance.update();
            } catch(e) {
                this.isInitialized = false;
                console.error(`Runtime Error w skrypcie ${this.name} na obiekcie ${this.gameObject?.name}: ${e}`);
                console.warn(`Skrypt ${this.name} zostal zatrzymany dla bezpieczenstwa aplikacji.`)
            }
        }
    }
}