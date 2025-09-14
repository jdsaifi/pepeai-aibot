import mongoose from 'mongoose';
import config from '../config';
import { sign, Secret } from 'jsonwebtoken';
import { AIMessageLogModel } from '../model/aiMessageLog';
// import ms from 'ms';

/** generate access token */
export const generateAccessToken = (data: object) => {
    const expiresIn: string = config.jwt.exp || '8h';
    const tokenKey: Secret = String(
        config.jwt.secret || 'generateUniqueID_(_32_)'
    );

    const token = sign(data, tokenKey);

    return token;
}; // END

/** */
export const toMongoId = (id: string) => new mongoose.Types.ObjectId(id); // END

/** calculate success rate */
export async function getAIMessageSuccessRate(
    groupId: number | string
): Promise<number> {
    const total = await AIMessageLogModel.countDocuments({ groupId });
    const successful = await AIMessageLogModel.countDocuments({
        groupId,
        success: true,
    });

    if (total === 0) return 0;

    return (successful / total) * 100;
}
