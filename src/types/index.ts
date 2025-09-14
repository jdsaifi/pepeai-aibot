import { Document, Types } from 'mongoose';

/**
 * user interface
 */
export interface IUser extends Document {
    userId: number; // Unique identifier for the user
    firstName: string | null; // First name of the user
    lastName: string | null;
    username: string | null;
    photoUrl: string | null;
    loginAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    generateAccessToken(): Promise<string>;
}

/**
 * group interface
 */
export interface IQuestions extends Document {
    question: string;
    answer: string;
    category: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IKB extends Document {
    title: string;
    content: string;
    category: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IGroup extends Document {
    groupId: string | number; // Unique identifier for the group
    groupName: string;
    groupUsername?: string;
    groupDescription?: string;
    groupPhotoUrl?: string;
    groupType: 'group' | 'supergroup';
    addedBy: number | null; // User ID of the admin who added the group
    groupBotUsername: string; // Username of the bot in the group
    groupBotToken: string;
    AIPersona: string; // Persona of the bot in the group
    kb: IKB[];
    positiveQuestions: IQuestions[];
    negativeQuestions: IQuestions[];
    messageCount: number; // Total messages in the group
    userCount: number; // Total users in the group
    agentName?: string;
    agentTriggerKeywords?: string[]; // Comma-separated keywords for AI processing
    admins: number[];
    isLeft: boolean;
    leftAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateGroupInput {
    groupId: string | number; // Unique identifier for the group
    groupName?: string;
    groupUsername?: string;
    groupDescription?: string;
    groupPhotoUrl?: string;
    groupType: 'group' | 'supergroup';
    addedBy?: number | null; // User ID of the admin who added the group
    groupBotUsername?: string; // Username of the bot in the group
    groupBotToken?: string;
    AIPersona?: string; // Persona of the bot in the group
    kb?: string;
}

/**
 * group member interface
 */
// export interface IGroupMember extends Document {
//     group: Types.ObjectId | IGroup;
//     userId: string | number; // Unique identifier for the user
//     groupId: string | number; // Unique identifier for the
//     firstName: string | null; // First name of the user
//     lastName: string | null;
//     username: string | null;
//     photoUrl: string | null;
//     createdAt: Date;
//     updatedAt: Date;
// }

/**
 * message interface
 */

export interface IMessage extends Document {
    group: Types.ObjectId | IGroup;
    groupId: string | number; // Unique identifier for the group
    senderId: number; // User ID of the sender
    senderName: string | null; // Name of the sender
    senderUsername: string | null; // Username of the sender
    message: any;
}

export interface CreateMessageInput {
    group: Types.ObjectId; // Reference to the group
    groupId: string | number; // Unique identifier for the group
    senderId: number; // User ID of the sender
    senderName?: string | null; // Name of the sender
    senderUsername?: string | null; // Username of the sender
    message: any; // The message content
}

/**
 * AI message log interface
 */

export interface IAIMessageLog extends Document {
    group: Types.ObjectId | IGroup;
    groupId: string | number; // Unique identifier for the group
    senderId: number; // User ID of the sender
    messageText: any;
    messageId: string | null;
    response?: any; // AI response content
    success?: boolean; // Whether the AI response was successful
}
