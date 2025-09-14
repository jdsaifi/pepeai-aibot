import { IMessage } from '@/types';
import { model, Schema } from 'mongoose';

const MessageSchema = new Schema<IMessage>(
    {
        group: { type: Schema.Types.ObjectId, ref: 'Group', required: true },
        groupId: { type: String, required: true },
        senderId: { type: Number, required: true },
        senderName: { type: String, required: false, default: null },
        senderUsername: { type: String, required: false, default: null },
        message: { type: Schema.Types.Mixed, required: true },
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

export const MessageModel = model<IMessage>(
    'Message',
    MessageSchema,
    'messages'
);
