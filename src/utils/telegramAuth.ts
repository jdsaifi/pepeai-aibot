import crypto from 'crypto';
import config from '../config';
import { consoleLog } from './consoleLog';

export interface ITgAuthData {
    id: number;
    first_name?: string;
    last_name?: string;
    username?: string;
    photo_url?: string;
    auth_date: number;
    hash: string;
}

export const validateTelegramAuth = async (input: ITgAuthData) => {
    try {
        const queryString = Object.keys(input)
            .map((key) => `${key}=${encodeURIComponent((input as any)[key])}`)
            .join('&');

        const initData = new URLSearchParams(queryString);
        initData.sort();
        const tgHash = initData.get('hash');

        // todo: check if auth date expired
        //     // if (new Date() - new Date(initData.get('auth_date') * 1000) > 86400000) {
        //     // }

        const dataToCheck: string[] = [];
        initData.forEach(
            (v, k) => k !== 'hash' && dataToCheck.push(`${k}=${v}`)
        );

        const secret_key = crypto
            .createHash('sha256')
            .update(config.tgBotToken!)
            .digest();

        const calculatedHash = crypto
            .createHmac('sha256', secret_key)
            .update(dataToCheck.join('\n'))
            .digest('hex');

        consoleLog.log('tg hash: ', tgHash);
        consoleLog.log('ca hash: ', calculatedHash);
        return tgHash === calculatedHash;
    } catch (err: any) {
        return false;
    }
};
