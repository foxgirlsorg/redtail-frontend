type AsyncFn<TArgs extends any[], TResult> = (...args: TArgs) => Promise<TResult>;

export function createScopedLoader<TArgs extends any[], TResult>(fn: AsyncFn<TArgs, TResult>) {
    const calls = new Map<string, { promise: Promise<TResult>, usesLeft: number }>();

    return (...args: TArgs): Promise<TResult> => {
        const key = JSON.stringify(args);

        if (!calls.has(key)) {
            const promise = fn(...args);
            calls.set(key, { promise, usesLeft: 2 }); // Exactly two uses
        }

        const record = calls.get(key)!;

        record.usesLeft--;

        if (record.usesLeft <= 0) {
            calls.delete(key);
        }

        return record.promise;
    };
}
