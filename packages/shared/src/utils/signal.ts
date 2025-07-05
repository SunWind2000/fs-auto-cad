import { isFunction, isAsyncFunction, AppLogger } from ".";

/**
 * Signal class for managing event _listeners and dispatching events.
 * This class allows you to add, remove, and dispatch events with optional data.
 * * @example
 * ```typescript
 * import { Signal } from '@fs/shared';
 * const signal = new Signal<{ key: string }>();
 * 
 * // Add a listener
 * const listener = signal.on((data) => {}, this);
 * // Dispatch an event
 * signal.dispatch({ key: 'value' });
 * // Remove a listener
 * signal.off(listener);
 * // Or remove a listener by passing the listener function directly
 * listener.off();
 * // Clear all listeners
 * signal.clear();
 * // Add a one-time listener
 * signal.once((data) => {}, this);
 * ```
 */
export class Signal<T = unknown> {

    private _listeners: SignalListener<T>[] = [];
    private _context: unknown;

    constructor(context?: unknown) {
        this._context = context;
    }

    public get context(): unknown {
        return this._context;
    }

    /**
     * Adds a listener to the signal.
     * @param listener The listener function to add.
     * @param context Optional context to bind the listener.
     * @return A SignalListener instance that can be used to remove the listener later.
     */
    public on(listener: IListenerExecutor<T>, context?: unknown)  {
        if (!isFunction(listener) && !isAsyncFunction(listener)) {
            AppLogger.error("Signal", "Listener must be a function or an async function.");
        }

        const boundListener = new SignalListener(listener, this, context ?? this._context);
        this._listeners.push(boundListener);

        // Ensure the listener is unique
        this._listeners = Array.from(new Set(this._listeners));

        return boundListener;
    }

    /**
     * Removes a listener from the signal.
     * @param listener The listener function to remove.
     */
    public off(listener: SignalListener<T>): void {
        this._listeners = this._listeners.filter(l => l !== listener);
    }

    /**
     * Dispatches an event to all registered _listeners.
     * @param data The data to pass to the _listeners.
     */
    public dispatch(data: T): void {
        this._listeners.forEach(listener => {
            listener.exec(data);
        });
    }

    /**
     * Clears all _listeners from the signal.
     */
    public clear(): void {
        this._listeners = [];
    }

    /**
     * Adds a one-time listener to the signal.
     * The listener will be removed after it is called once.
     * @param listener The listener function to add.
     * @param context Optional context to bind the listener.
     */
    public once(listener: IListenerExecutor<T>, context?: unknown): void {
        if (!isFunction(listener) && !isAsyncFunction(listener)) {
            AppLogger.error("Signal", "Listener must be a function or an async function.");
        }

        // Create a bound listener that will remove itself after execution
        const boundListener = this.on(async(data) => {
            let result: unknown = void 0;

            if (isFunction(listener)) {
                result = listener(data);
            } else if (isAsyncFunction(listener)) {
                result = await listener(data);
            } else {
                AppLogger.error("Signal", "Listener must be a function or an async function.");
            }

            // If the listener returns false, do not remove it
            if (result === false) {
                return;
            }

            boundListener.off();
        }, context);
    }
    
    /**
     * Gets the current listeners of the signal.
     * @returns An array of SignalListener instances.
     */
    public get listeners(): SignalListener<T>[] {
        return [...this._listeners];
    }
}

export class SignalListener<T> {

    private _listener: IListenerExecutor<T>;
    private _signal: Signal<T> | null;
    private _target: unknown;

    constructor(listener: IListenerExecutor<T>, signal: Signal<T>, target?: unknown) {
        this._listener = listener;
        this._signal = signal;
        this._target = target;
    }

    public exec(data: T): void {
        this._listener.call(this._target, data);
    }

    public off() {
        if (this._signal) {
            this._signal.off(this);
            this._signal = null; // Clear the reference to avoid memory leaks
        }
    }

}


export type IListenerExecutor<T> = (data: T) => unknown;
