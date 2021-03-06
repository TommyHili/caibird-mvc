/**
 * @Owners cmZhou
 * @Title public 函数工具
 */
export namespace uFunction {
    export const noop = () => { };

    // eslint-disable-next-line @typescript-eslint/ban-types
    export const check = <T extends Function = Function>(fn: unknown): fn is T => typeof fn === 'function';

    // eslint-disable-next-line @typescript-eslint/ban-types
    export const checkExtendsClass = <T extends Function>(sonClass: dp.AllowNon<Function>, fatherClass: T): sonClass is T =>
        sonClass ? Object.isPrototypeOf.call(fatherClass.prototype, sonClass.prototype as dp.Obj) : false;
}

export default uFunction;
