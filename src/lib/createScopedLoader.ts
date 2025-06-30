type AsyncFn<TArgs extends any[], TResult> = (...args: TArgs) => Promise<TResult>;

export function createScopedLoader<TArgs extends any[], TResult>(fn: AsyncFn<TArgs, TResult>) {
    const calls = new Map<string, Promise<TResult>>();

    return (...args: TArgs): Promise<TResult> => {
        const key = JSON.stringify(args);
        if (!calls.has(key)) {
            calls.set(key, fn(...args));
        }
        return calls.get(key)!;
    };
}