import { Logger } from '../utils/logger';
import { getRabbitMQChannel } from '../library/rabbitmq';
import config from '../config';
import GroupService from '../services/groupService';
import { ConsumeMessage } from 'amqplib';

const upsertGroup = async (message: ConsumeMessage) => {
    const update = JSON.parse(message.content.toString());
    if (!update.message || !update.message.chat) {
        Logger.error({
            event: 'Invalid message format in consumeGroupHandler',
            content: message.content.toString(),
        });
        return;
    }

    const { chat: group, from: user } = update.message;

    // console.log('upsertGroup called with update: ', update);
    const input = {
        groupId: group.id,
        groupName: group.title,
        groupType: group.type,
        addedBy: user ? user.id : null,
    };
    const groupService = GroupService.getInstance();
    await groupService.createGroup(input);
};

async function consumeGroupHandler() {
    const channel = await getRabbitMQChannel();

    const q = await channel.assertQueue('', { exclusive: true });
    Logger.info({
        event: 'Waiting for messages in consumeGroupHandler',
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
                    event: 'Received message at (consumeGroupHandler)',
                    content: msg.content.toString(),
                });
                upsertGroup(msg);
                Logger.info('\n');
                channel.ack(msg);
            }
        },
        { noAck: false }
    );
}

export default consumeGroupHandler;
