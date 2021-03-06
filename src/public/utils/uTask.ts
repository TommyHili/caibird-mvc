/**
 * @Owners cmZhou
 * @Title task util
 */

export namespace uTask {
    export const sleep = async (delay = 100) => new Promise<undefined>(resolve => {
        setTimeout(resolve, delay);
    });

    export const retry = async <T extends dp.Func>(task: T, opt: {
        maxRunTimes?: number,
        delay?: number,
        shouldRetry?(params: { error: unknown, nowRunTimes: number }): dp.PromiseOrSelf<boolean>,
    } = {}) => {
        const { maxRunTimes = 5, delay, shouldRetry } = opt;
        const errors: unknown[] = [];
        for (let i = 1; i <= maxRunTimes; i++) {
            try {
                return task() as Promise<ReturnType<T>>;
            } catch (e: unknown) {
                if (!shouldRetry || await shouldRetry({ error: e, nowRunTimes: i })) {
                    errors.push(e);
                    if (delay != null) {
                        await sleep(delay);
                    }
                } else {
                    break;
                }
            }
        }
        // eslint-disable-next-line @typescript-eslint/no-throw-literal
        throw errors;
    };
}

export default uTask;
