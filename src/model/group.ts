import { IGroup, IKB, IQuestions } from '@/types';
import { model, Schema } from 'mongoose';

const QuestionsSchema = new Schema<IQuestions>(
    {
        question: {
            type: String,
            default: '',
        },
        answer: {
            type: String,
            default: '',
        },
        category: {
            type: String,
            default: '',
        },
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

const KBSchema = new Schema<IKB>(
    {
        title: { type: String, default: '' },
        content: { type: String, default: '' },
        category: { type: String, default: '' },
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

const GroupSchema = new Schema<IGroup>(
    {
        groupId: { type: String, required: true },
        groupName: { type: String, required: false, default: null },
        groupUsername: { type: String, required: false, default: null },
        groupDescription: { type: String, required: false, default: null },
        groupPhotoUrl: { type: String, required: false, default: null },
        groupType: {
            type: String,
            enum: ['group', 'supergroup'],
            required: true,
        },
        addedBy: { type: Number, required: false, default: null },
        groupBotUsername: { type: String, required: false, default: null },
        groupBotToken: { type: String, required: false, default: null },
        AIPersona: { type: String, required: false, default: null },
        kb: { type: [KBSchema], required: false, default: [] },
        positiveQuestions: { type: [QuestionsSchema], default: [] },
        negativeQuestions: { type: [QuestionsSchema], default: [] },
        messageCount: { type: Number, default: 0 },
        userCount: { type: Number, default: 0 },
        agentName: { type: String, default: '' },
        agentTriggerKeywords: {
            type: [String],
            required: false,
            default: null,
        },
        admins: {
            type: [Number],
            required: false,
            default: [],
        },
        isLeft: { type: Boolean, default: false },
        leftAt: { type: Date, required: false, default: null },
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

export const GroupModel = model<IGroup>('Group', GroupSchema);

// (async () => {
//     const groups = await GroupModel.find({});
//     console.log('Groups in the database:', groups.length);
// })();
