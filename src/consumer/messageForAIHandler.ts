import AIMessageLogService from '../services/aiMessageLogService';
import config from '../config';
import { getRabbitMQChannel } from '../library/rabbitmq';
import GroupService from '../services/groupService';
import { Logger } from '../utils/logger';
import { ConsumeMessage } from 'amqplib';

const processMessageForAI = async (message: ConsumeMessage) => {
    // todo: publish message to rabbitmq for AI Agent Processing
    try {
        const update = JSON.parse(message.content.toString());
        if (!update.message || !update.message.chat) {
            Logger.error({
                event: 'Invalid message format in processMessageForAI',
                content: message.content.toString(),
            });
            return;
        }

        const { chat, from: user } = update.message;

        // todo: improvement fetch group settings from cache instead of DB
        const groupService = GroupService.getInstance();
        const group = await groupService.getGroupByTgId(chat.id);

        if (!group) {
            Logger.error({
                event: 'Group not found for AI processing',
                groupId: chat.id,
            });
            return;
        }

        if (!('text' in update.message)) {
            Logger.error({
                event: 'Message is not a text message',
                content: update.message,
            });
            return;
        }

        const triggerWords: any[] | undefined = (
            group?.agentTriggerKeywords || []
        )?.map((word: string) => word.trim().toLowerCase());

        const messageText = update.message.text.toLowerCase();
        const shouldTriggerAgent = (triggerWords || ['admin'])?.some((word) =>
            messageText?.toLowerCase().includes(word)
        );

        if (!shouldTriggerAgent) {
            return;
        }

        const input = {
            groupId: chat.id,
            senderId: user.id,
            messageText: update.message.text,
            messageId: update.message.message_id,
            messageLogId: null as string | null,
        };

        const aiMessageLogService = AIMessageLogService.getInstance();
        const aiMessageLogResponse = await aiMessageLogService.createMessageLog(
            {
                ...input,
                group: group._id as string,
            }
        );

        input['messageLogId'] = aiMessageLogResponse._id;

        // Publish to RabbitMQ
        const channel = await getRabbitMQChannel();
        channel.publish(
            config.rabbitmq.tgUpdateExchange,
            '',
            Buffer.from(JSON.stringify(input)),
            {
                persistent: true, // Make message persistent
            }
        );
        Logger.info('Message published to agent');
    } catch (error) {
        Logger.error({
            event: 'Error processing message for AI',
            error,
            content: message.content.toString(),
        });
    }
};

async function consumeMessageForAIHandler() {
    const channel = await getRabbitMQChannel();

    const q = await channel.assertQueue('', { exclusive: true });
    Logger.info({
        event: 'Waiting for messages in consumeMessageForAIHandler',
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
                    event: 'Message Received in (consumeMessageForAIHandler)',
                    content: msg.content.toString(),
                });
                processMessageForAI(msg);
                Logger.info('\n');
                channel.ack(msg);
            }
        },
        { noAck: false }
    );
}
export default consumeMessageForAIHandler;
