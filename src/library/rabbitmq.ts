import amqp from 'amqplib';
import config from '../config';
import { Logger } from '../utils/logger';

let connection: any = null;
let channel: amqp.Channel | null = null;

export async function connectRabbitMQ() {
    if (connection && channel) {
        return { connection, channel };
    }
    try {
        console.log('Connecting to RabbitMQ... to url:', config.rabbitmq.url);
        connection = await amqp.connect(config.rabbitmq.url);
        channel = await connection.createChannel();
        if (!connection || !channel) {
            throw new Error('Failed to create RabbitMQ connection or channel');
        }
        Logger.info('Connected to RabbitMQ');

        // Assert Telegram Update Processing Exchanges and Queues
        await channel.assertExchange(
            config.rabbitmq.tgUpdateExchange,
            'direct',
            { durable: true }
        );
        await channel.assertExchange(
            config.rabbitmq.failedTgUpdateDlx,
            'direct',
            {
                durable: true,
            }
        );
        await channel.assertQueue(config.rabbitmq.failedTgUpdateDlq, {
            durable: true,
        });
        await channel.bindQueue(
            config.rabbitmq.failedTgUpdateDlq,
            config.rabbitmq.failedTgUpdateDlx,
            ''
        );
        await channel.assertQueue(config.rabbitmq.pendingTgUpdateQueue, {
            durable: true,
            arguments: {
                'x-dead-letter-exchange': config.rabbitmq.failedTgUpdateDlx,
            },
        });
        await channel.bindQueue(
            config.rabbitmq.pendingTgUpdateQueue,
            config.rabbitmq.tgUpdateExchange,
            ''
        );

        // Test fanout exchange
        await channel.assertExchange(
            config.rabbitmq.telegramUpdateExchange,
            'fanout',
            {
                durable: false,
            }
        );

        return { connection, channel };
    } catch (error) {
        Logger.error({
            event: 'RabbitMQ Connection Error',
            error,
        });
        // Implement robust retry logic here for production
        process.exit(1); // Or handle more gracefully
    }
}

export async function getRabbitMQChannel(): Promise<amqp.Channel> {
    if (!channel) {
        await connectRabbitMQ();
    }
    return channel!;
}

export async function closeRabbitMQ() {
    if (channel) await channel.close();
    // if (connection) await connection.close();
    console.log('RabbitMQ connection closed');
}
