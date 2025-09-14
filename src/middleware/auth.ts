import { UserModel } from '../model/users';
import config from '../config';

import { JwtPayload, verify } from 'jsonwebtoken';
import { Logger } from '../utils/logger';
import { NextFunction, Request, Response } from 'express';
import { consoleLog } from '../utils/consoleLog';

export const authorizeUserRequest = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const token: string =
        req.cookies?.pepeaiAccessToken ||
        req.headers['x-access-token'] ||
        req.header('Authorization')?.replace('Bearer ', '') ||
        req.body?.pepeaiAccessToken ||
        req.query?.pepeaiAccessToken;

    consoleLog.log('\n\n\n token: ', token);

    if (!token) {
        throw new Error('Invalid access token');
    }

    try {
        const tokenKey: string = config.jwt.secret || 'NOSECRET';
        const decoded: JwtPayload | string = verify(token, tokenKey);
        const { sub } = decoded;
        consoleLog.log('Token:', token);
        consoleLog.log('decoded:', decoded);
        const user = await UserModel.findById({ _id: sub });

        consoleLog.log('\n\nuser==========>:', user);

        if (!user) {
            throw new Error('Invalid access token');
        }
        res.locals.user = user;
        next();
    } catch (err) {
        Logger.error({
            event: '[User Auth Middleware Error]',
            error: err,
        });

        throw new Error('Invalid access token');
    }
};
