import { IAIMessageLog } from '../types';
import { model, Schema } from 'mongoose';

const AIMessageLogSchema = new Schema<IAIMessageLog>(
    {
        group: { type: Schema.Types.ObjectId, ref: 'Group', required: true },
        groupId: { type: String, required: true },
        senderId: { type: Number, required: true },
        messageText: { type: Schema.Types.Mixed, required: true },
        messageId: { type: String, required: false, default: null },
        response: { type: Schema.Types.Mixed, required: false, default: null },
        success: { type: Boolean, required: false, default: false },
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

export const AIMessageLogModel = model<IAIMessageLog>(
    'AIMessageLogs',
    AIMessageLogSchema,
    'ai_message_logs'
);
