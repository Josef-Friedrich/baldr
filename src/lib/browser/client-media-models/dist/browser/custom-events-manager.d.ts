/**
 * A simple wrapper class for a custom event system. Used in the classes
 * `Sample()` and `Player()`.
 */
declare class CustomEventsManager {
    /**
     * An object of callback functions
     */
    private callbacks;
    constructor();
    /**
     * Trigger a custom event.
     *
     * @param name - The name of the event. Should be in lowercase, for
     *   example `fadeoutbegin`.
     * @param args - One ore more additonal arguments to pass through
     *   the callbacks.
     */
    trigger(name: string): void;
    /**
     * Register callbacks for specific custom event.
     *
     * @param name - The name of the event. Should be in lowercase, for
     *   example `fadeoutbegin`.
     * @param callback - A function which gets called when the
     *   event is triggered.
     */
    on(name: string, callback: Function): void;
}
