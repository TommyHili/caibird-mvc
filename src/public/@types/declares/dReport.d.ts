/**
 * @Owners cmZhou
 * @Title report常用类型
 */
declare namespace dReport {
    type InitOptions = {
        maxLogSize?: {
            [k in eReport.LogType]?: number;
        },

        alwaysLog?: boolean,

        pathWhiteList?: string[],
        pathIgnoreList?: string[],
        projectLogName?: string,

        dbLogPathWhiteListWhenAlways?: string[],

        whiteListCtxKeys?: string[],
        whiteListCtxValues?: string[],

        useConsoleLog?: boolean,
    };

    type LogOptions = {
        key: string,
        msg?: string,
        details?: dp.Obj | Partial<Error>,
        error?: dp.Obj | Partial<Error>,
        source?: dp.Obj | Partial<Error>,
        attribute?: boolean,
        always?: boolean,
        type?: eReport.LogType,
        level?: 'error' | 'info',
    };

    type LogInfo = {
        type: eReport.LogType,
        level: 'error' | 'info',
        key: unknown,
        date: unknown,
        time: unknown,
        msg: unknown,
        uuid: unknown,
        fetchId: unknown,
        details: unknown,
        error: unknown,
        source: unknown,
        logStack: unknown,
        ctx: {
            header: {
                request: unknown,
                response: unknown,
            },
            body: {
                request: unknown,
                response: unknown,
            },
            type: {
                request: unknown,
                response: unknown,
            },
            query: unknown,
            ips: unknown,
            path: unknown,
            url: unknown,
            originalUrl: unknown,
            session: unknown,
            status: unknown,
            method: unknown,
        } | null,
    };

    type ErrorLogOptions = Omit<LogOptions, 'key' | 'source'> & {
        key?: string,
    };
}
