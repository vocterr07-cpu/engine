import { storeActions, type LogEntry } from "./store";

// Mapowanie typów konsoli na typy naszego store'a
type ConsoleMethod = 'log' | 'warn' | 'error' | 'info';

class LoggerService {
    private queue: LogEntry[] = [];
    private isProcessing = false;
    private maxBatchSize = 100;
    private originalConsole = { ...console };

    public config = {
        silenceBrowserLogs: true, // Jeśli true, logi nie zaśmiecają konsoli F12
        bufferLimit: 500
    };

    init() {
        const methods: ConsoleMethod[] = ['log', 'warn', 'error', 'info'];

        methods.forEach((method) => {
            // @ts-ignore
            console[method] = (...args: any[]) => {
                // 1. Formatowanie
                const message = args.map(arg => {
                    if (arg instanceof Error) return `${arg.name}: ${arg.message}`;

                    if (typeof arg === 'object' && arg !== null) {
                        // Sprawdzamy, czy to nasz GameObject lub Component
                        if ('name' in arg) return `[Object: ${arg.name}]`;

                        try {
                            // Próbujemy stringify, ale jeśli zawiedzie, zwracamy opis
                            return JSON.stringify(arg);
                        } catch (e) {
                            return "[Complex Object]";
                        }
                    }
                    return String(arg);
                }).join(' ');

                // 2. Dodanie do kolejki (zgodne z interfejsem LogEntry w store)
                this.queue.push({
                    id: crypto.randomUUID(),
                    timestamp: new Date().toLocaleTimeString(),
                    message,
                    type: method === 'info' ? 'log' : method // mapujemy info na log lub zostawiamy
                });

                // 3. Opcjonalne wywołanie oryginału
                if (!this.config.silenceBrowserLogs) {
                    // @ts-ignore
                    this.originalConsole[method](...args);
                }

                // 4. Uruchomienie wysyłki
                this.scheduleFlush();
            };
        });

        window.addEventListener('error', (event) => {
            console.error(`Uncaught Error: ${event.message} at ${event.filename}:${event.lineno}`);
        });
    }

    private scheduleFlush() {
        if (this.isProcessing) return;
        this.isProcessing = true;
        requestAnimationFrame(() => this.flush());
    }

    private flush() {
        if (this.queue.length === 0) {
            this.isProcessing = false;
            return;
        }

        // Wycinamy paczkę logów
        const batch = this.queue.splice(0, this.maxBatchSize);

        // WYSYŁAMY DO STORE (To jest kluczowe!)
        storeActions.addLogsBatch(batch);

        if (this.queue.length > 0) {
            requestAnimationFrame(() => this.flush());
        } else {
            this.isProcessing = false;
        }
    }
}

export const Logger = new LoggerService();