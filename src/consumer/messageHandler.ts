import { getRabbitMQChannel } from '../library/rabbitmq';
import { Logger } from '../utils/logger';
import config from '../config';
import { ConsumeMessage } from 'amqplib';
import MessageService from '../services/messageService';
import GroupService from '../services/groupService';
import bot from '../bot';

const increaseGroupMessageCount = async (message: ConsumeMessage) => {
    const update = JSON.parse(message.content.toString());
    if (!update.message || !update.message.chat) {
        Logger.error({
            event: 'Invalid message format in consumeMessageHandler',
            content: message.content.toString(),
        });
        return;
    }

    const { chat: group } = update.message;
    const groupService = GroupService.getInstance();
    groupService.incrementMessageCount(group?.id);
};

const updateMemberCount = async (message: ConsumeMessage) => {
    const update = JSON.parse(message.content.toString());
    if (!update.message || !update.message.chat) {
        Logger.error({
            event: 'Invalid message format in consumeMessageHandler',
            content: message.content.toString(),
        });
        return;
    }

    const { chat: group } = update.message;

    const memberCount = await bot.telegram.getChatMembersCount(group.id);
    const groupService = GroupService.getInstance();
    groupService.updateGroupMemberCount(group.id, memberCount);
};

const insertMessage = async (message: ConsumeMessage) => {
    const update = JSON.parse(message.content.toString());
    if (!update.message || !update.message.chat) {
        Logger.error({
            event: 'Invalid message format in consumeMessageHandler',
            content: message.content.toString(),
        });
        return;
    }

    const { chat: group, from: user } = update.message;

    const input = {
        groupId: group.id,
        senderId: user.id,
        senderName: `${user.first_name} ${user.last_name || ''}`.trim(),
        senderUsername: user.username || null,
        message: update,
    };
    const messageService = MessageService.getInstance();
    await messageService.createMessage(input);
};

async function consumeMessageHandler() {
    const channel = await getRabbitMQChannel();

    const q = await channel.assertQueue('', { exclusive: true });
    Logger.info({
        event: 'Waiting for messages in consumeMessageHandler',
        queue: q.queue,
    });
    await channel.bindQueue(
        q.queue,
        config.rabbitmq.telegramUpdateExchange,
        ''
    );
    channel.consume(
        q.queue,
        (msg) => {
            if (msg !== null) {
                Logger.info({
                    event: 'Message Received in (consumeMessageHandler)',
                    content: msg.content.toString(),
                });
                updateMemberCount(msg);
                increaseGroupMessageCount(msg);
                insertMessage(msg);
                Logger.info('\n');
                channel.ack(msg);
            }
        },
        { noAck: false }
    );
}
export default consumeMessageHandler;
