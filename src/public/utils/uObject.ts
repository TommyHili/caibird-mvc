/**
 * @Owners cmZhou
 * @Title public obj工具
 */
import stringify from 'json-stringify-safe';

export namespace uObject {
    // eslint-disable-next-line @typescript-eslint/ban-types
    export const check = (obj: unknown): obj is object => typeof obj === 'object';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    export const checkInstance = <I, T extends dp.Class<any[], any>>(obj: I, type: T): obj is InstanceType<T> => obj instanceof type;

    export const removeUndefinedProp = <T extends dp.Obj>(value: T) => {
        const result = {
            ...value,
        };
        for (const k in result) {
            if (result[k] === undefined) {
                delete result[k];
            }
        }

        return result;
    };

    export const deleteKey = <T extends dp.Obj>(obj: T, key: keyof T) => {
        delete obj[key];
        return obj;
    };

    export const parseJson = <T>(str: dp.AllowNon<string>) => {
        if (!str) return null;
        try {
            return JSON.parse(str) as T;
        } catch {
            return null;
        }
    };

    export const safeStringify = stringify;

    export const getSafeJsonObj = <T extends dp.Obj>(obj: T) => {
        const res = parseJson<T>(safeStringify(obj));
        if (res) return res;
        throw new Error('getSafeJsonObj 执行异常');
    };
}

export default uObject;
