import { AIMessageLogModel } from '../model/aiMessageLog';

interface ICreateMessageLogInput {
    group: string;
    groupId: number | string;
    senderId: number | string;
    messageText: string;
    messageId: number | string;
}

interface IAICreateMessageLogResponse {
    _id: string;
}

export default class AIMessageLogService {
    private static instance: AIMessageLogService;

    private constructor() {}

    public static getInstance(): AIMessageLogService {
        if (!AIMessageLogService.instance) {
            AIMessageLogService.instance = new AIMessageLogService();
        }
        return AIMessageLogService.instance;
    }

    public async createMessageLog(
        input: ICreateMessageLogInput
    ): Promise<IAICreateMessageLogResponse> {
        // Logic to create a group
        const response = await AIMessageLogModel.create(input);
        return { _id: response._id as string };
    }

    public async updateMessageLogResponse(
        logId: string,
        response: string
    ): Promise<void> {
        // Logic to update ai message log with response and success
        await AIMessageLogModel.findByIdAndUpdate(logId, {
            response,
            success: true,
        });
    }
}
