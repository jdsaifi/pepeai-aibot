import { IUser } from '../types';
import { generateAccessToken } from '../utils/helper';
import { model, Schema } from 'mongoose';

const UserSchema = new Schema<IUser>(
    {
        userId: { type: Number, required: true },
        firstName: { type: String, required: false, default: null },
        lastName: { type: String, required: false, default: null },
        username: { type: String, required: false, default: null },
        photoUrl: { type: String, required: false, default: null },
        loginAt: { type: Date, required: false, default: null },
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
        },
        toObject: {
            virtuals: true,
        },
    }
);

// generate access token
UserSchema.methods.generateAccessToken = function (): string {
    const payload = {
        sub: this._id,
    };
    return generateAccessToken(payload);
}; // END

export const UserModel = model<IUser>('User', UserSchema);
