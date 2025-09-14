import config from '../config';
import AuthService, { ILoginResponse } from '../services/authService';
import { consoleLog } from '../utils/consoleLog';
import { validateTelegramAuth } from '../utils/telegramAuth';
import { CookieOptions, Request, Response } from 'express';

/** telegram login */
export const telegramLoginHandler = async (req: Request, res: Response) => {
    const body = req.body;
    consoleLog.log('request body: ', body);

    const isValid = await validateTelegramAuth(body);
    if (!isValid) {
        return res.status(401).json({ message: 'Invalid authentication data' });
    }
    // todo: save user to database
    const authService = AuthService.getInstance();
    const result: ILoginResponse = await authService.loginTelegramUser(body);

    const cookieOptions: CookieOptions = {
        httpOnly: true,
        secure: config.isSecure,
        domain: config.isSecure ? config.domain : undefined,
        sameSite: 'lax',
        path: '/',
    };

    res.cookie('pepeaiAccessToken', result.token, cookieOptions);
    return res
        .status(201)
        .json({ code: 201, message: 'Login successful', result });
};
