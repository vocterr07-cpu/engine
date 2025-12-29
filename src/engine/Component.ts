import type GameObject from "./GameObject";

export default class Component {
    public id: string = crypto.randomUUID();
    public name: string;
    public gameObject: GameObject | null = null;

    constructor(name: string) {
        this.name = name;
    }

    public start(): void {};
    public update(): void {};

    public getIcon(): void {};
}