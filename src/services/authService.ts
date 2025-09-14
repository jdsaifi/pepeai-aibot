import { UserModel } from '../model/users';
import { IUser } from '../types';
import { ITgAuthData } from '../utils/telegramAuth';

export interface ILoginResponse {
    user: IUser;
    token?: string;
}

export default class AuthService {
    private static instance: AuthService;

    private constructor() {}

    public static getInstance(): AuthService {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
        }
        return AuthService.instance;
    }

    public async loginTelegramUser(
        input: ITgAuthData
    ): Promise<ILoginResponse> {
        // Logic to handle Telegram user login

        const query = { userId: input?.id };
        const data = {
            ...input,
            loginAt: new Date(),
        };

        const user = await UserModel.findOneAndUpdate(query, data, {
            upsert: true,
            new: true,
        });

        const token = await user.generateAccessToken();

        return {
            user,
            token,
            // refreshToken
        };
    }
}
