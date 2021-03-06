/**
 * @Owners cmZhou
 * @Title 常用异常类
 */
let compatible: (instance: Error, args: unknown[]) => void = () => { };

export const setCompatible = (fn: typeof compatible) => compatible = fn;

namespace _cError {
    export class BassError extends Error { }

    export class CommonError extends BassError {
        public constructor(
            public readonly options: dError.F.Options,
            public readonly logOptions: dReport.ErrorLogOptions | false = false,
            public readonly name = CommonError.name,
        ) {
            super();
            compatible(this, [...arguments]);
        }
    }

    export class ReactError extends CommonError {
        public constructor(
            public readonly details: {
                error: Error,
                errorInfo: React.ErrorInfo,
            },
            public readonly options: dError.F.Options,
            public readonly logOptions: dReport.ErrorLogOptions | false = false,
        ) {
            super(options, logOptions, ReactError.name);
            compatible(this, [...arguments]);
        }
    }

    export class ApiFetchFail extends CommonError {
        public constructor(
            public readonly details: {
                error: unknown,
                info: dRequest.F.WEB.FetchInfo,
            },
            public readonly options: dError.F.Options,
            public readonly logOptions: dReport.ErrorLogOptions | false = false,
        ) {
            super(options, logOptions, ApiFetchFail.name);
            compatible(this, [...arguments]);
        }
    }

    export class ApiJsonResultEmpty extends CommonError {
        public constructor(
            public readonly details: {
                info: dRequest.F.WEB.FetchInfo,
            },
            public readonly options: dError.F.Options,
            public readonly logOptions: dReport.ErrorLogOptions | false = false,
        ) {
            super(options, logOptions, ApiJsonResultEmpty.name);
            compatible(this, [...arguments]);
        }
    }

    export class ApiJsonResultError extends CommonError {
        public constructor(
            public readonly details: {
                rsp: dFetch.JsonBody,
                info: dRequest.F.WEB.FetchInfo,
            },
            public readonly options: dError.F.Options,
            public readonly logOptions: dReport.ErrorLogOptions | false = false,
        ) {
            super(options, logOptions, ApiJsonResultError.name);
            compatible(this, [...arguments]);
        }
    }

    export class LoginError extends CommonError {
        public constructor(
            public readonly details: {
                rsp: dFetch.JsonBody,
                info: dRequest.F.WEB.FetchInfo,
            },
            public readonly options: dError.F.Options,
            public readonly logOptions: dReport.ErrorLogOptions | false = false,
        ) {
            super(options, logOptions, LoginError.name);
            compatible(this, [...arguments]);
        }
    }

    export class VersionMismatch extends CommonError {
        public constructor(
            public readonly options: dError.F.Options,
            public readonly logOptions: dReport.ErrorLogOptions | false = false,
        ) {
            super(options, logOptions, VersionMismatch.name);
            compatible(this, [...arguments]);
        }
    }

    export class Noop extends BassError {
        public constructor(public msg?: string) {
            super();
            compatible(this, [...arguments]);
        }

        public readonly name = Noop.name;
    }
}

export const cError: dp.DeepReadonly<typeof _cError> = _cError;
export default cError;
