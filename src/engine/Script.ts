import Component from "./Component";
import { state } from "./store";

export default class Script extends Component {
    public sourceCode: string = "";
    private instance: any = null;
    private isInitialized: boolean = false;

    constructor(name: string) {
        super(name);
        // Kod startowy dla użytkownika
        this.sourceCode = `
class MyScript {
    gameObject; 
    isFlying = true;
    speed = 10.0;

    start() {
        console.log("Rakieta gotowa!");
    }

    update() {
        if (!this.isFlying) return;

        // Ruch do góry
        this.gameObject.position[1] += this.speed * 0.016;

        // Detonacja na wysokości 50
        if (this.gameObject.position[1] > 50) {
            this.explode();
        }
    }

    explode() {
        this.isFlying = false;
        this.gameObject.scale = [0, 0, 0];

        // Wywołanie systemu cząsteczek
        if (system && system.engine) {
             system.engine.spawnExplosion(
                this.gameObject.position[0],
                this.gameObject.position[1],
                this.gameObject.position[2],
                200,             // Ilość
                [1.0, 0.5, 0.0]  // Kolor
            );
            console.log("BOOM!");
        } else {
            console.error("Brak dostępu do silnika (system.engine)!");
        }
    }
}
`;
    }

    public compile() {
        if (!this.gameObject) return;
        
        try {
            // Przygotowujemy obiekt system
            const systemArg = {
                gameObject: this.gameObject,
                state: state,
                engine: state.engine
            };

            // WAŻNE: Nie deklarujemy tu 'const system', bo 'system' jest już argumentem funkcji!
            const apiWrapper = `
                // Helpery dla zmiennych globalnych
                const gv = new Proxy({}, {
                    get: (target, prop) => {
                        const v = system.state.variables.find(v => v.name === prop);
                        return v ? v.value : undefined;
                    },
                    set: (target, prop, value) => {
                        const v = system.state.variables.find(v => v.name === prop);
                        if (v) {
                            v.value = value;
                            return true;
                        }
                        return false;
                    }
                });

                // Tutaj wklejamy kod klasy użytkownika
                // Dzięki temu, że jest wewnątrz tej funkcji, "widzi" zmienną 'system' z argumentu
                ${this.sourceCode}

                return MyScript;
            `;

            // Tworzymy funkcję, która przyjmuje jeden argument o nazwie "system"
            const createClass = new Function("system", apiWrapper);
            
            // Wywołujemy ją, przekazując nasz obiekt
            const ClassDef = createClass(systemArg);

            if (!ClassDef || typeof ClassDef !== 'function') {
                throw new Error("Kod musi zawierać definicję klasy (np. class MyScript).");
            }

            // Tworzymy instancję
            this.instance = new ClassDef();
            this.instance.gameObject = this.gameObject;

            // Bindujemy metody
            if (this.instance.start) this.instance.start = this.instance.start.bind(this.instance);
            if (this.instance.update) this.instance.update = this.instance.update.bind(this.instance);

            // Odpalamy start
            if (this.instance.start) this.instance.start();

            this.isInitialized = true;
            console.log(`Skrypt ${this.name} działa.`);

        } catch (e) {
            this.isInitialized = false;
            console.error("BŁĄD SKRYPTU:", e);
        }
    }

    public update() {
        if (this.isInitialized && this.instance && this.instance.update) {
            try {
                this.instance.update();
            } catch (e) {
                this.isInitialized = false;
                console.error("Runtime Error:", e);
            }
        }
    }
}