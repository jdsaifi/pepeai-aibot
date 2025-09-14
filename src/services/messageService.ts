import { consoleLog } from '../utils/consoleLog';
import { GroupModel } from '../model/group';
import { CreateGroupInput, CreateMessageInput } from '../types';
import { MessageModel } from '../model/message';

export default class MessageService {
    private static instance: MessageService;

    private constructor() {}

    public static getInstance(): MessageService {
        if (!MessageService.instance) {
            MessageService.instance = new MessageService();
        }
        return MessageService.instance;
    }

    public async createMessage(
        input: Partial<CreateMessageInput>
    ): Promise<void> {
        // Logic to create a group
        const group = await GroupModel.findOne({
            groupId: input.groupId,
        });

        if (group) {
            const data = {
                ...input,
                group: group._id, // group reference
            };
            const newMessage = new MessageModel(data);
            await newMessage.save();
            consoleLog.log('Message created in group with ID:', input.groupId);
        } else {
            consoleLog.log('Group does not exist with ID:', input.groupId);
        }
    }

    public async deleteGroup(groupId: string): Promise<void> {
        // Logic to delete a group
        console.log(`Group with ID ${groupId} deleted.`);
    }
}
