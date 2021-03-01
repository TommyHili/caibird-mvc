/**
 * @Creater cmZhou
 * @Desc xml util
 */
import { OptionsV2, parseString } from 'xml2js';

export namespace uXml {
    export class XmlError extends Error {}

    export const createXmlStr = (params: dp.Obj<string>) => {
        let xmlStr = '<xml>';

        Object.keys(params).forEach(key => {
            xmlStr += `<${key}><![CDATA[`;
            xmlStr += params[key];
            xmlStr += `]]></${key}>`;
        });

        xmlStr += '</xml>';

        return xmlStr;
    };

    export const parse = async <T extends dp.Obj>(xmlStr: string, options: OptionsV2 & { timeout?: number } = {}) => new Promise<T>((resolve, reject) => {
        const { timeout = eDate.MsTimespan.PromiseTimeout } = options;

        if (options.explicitArray === undefined) {
            options.explicitArray = false;
        }
        parseString(xmlStr, options, (err, result: T) => {
            if (err) {
                reject(err);
            }
            resolve(result);
        });
        setTimeout(() => { reject(new XmlError('解析xml超时')); }, timeout);
    });
}

export default uXml;
