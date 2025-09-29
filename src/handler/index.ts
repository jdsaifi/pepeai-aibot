import { consoleLog } from '@/utils/consoleLog';
import config from '../config';
import { getRabbitMQChannel } from '../library/rabbitmq';
import { Logger } from '../utils/logger';
import { Request, Response } from 'express';

export const telegramWebhookHandler = async (req: Request, res: Response) => {
    res.status(200).json({
        status: 'ok',
        message: 'Webhook received',
        dt: new Date().toISOString(),
    });
    const message = req.body;
    Logger.info({
        event: 'Telegram Webhook Received',
        data: message,
    });

    try {
        const channel = await getRabbitMQChannel();

        // Publish to RabbitMQ
        // channel.publish(
        //     config.rabbitmq.tgUpdateExchange,
        //     '',
        //     Buffer.from(JSON.stringify(message)),
        //     {
        //         persistent: true, // Make message persistent
        //     }
        // );

        channel.publish(
            config.rabbitmq.telegramUpdateExchange,
            '',
            Buffer.from(JSON.stringify(message))
        );
    } catch (err) {
        Logger.error({
            event: 'Webhook Error',
            error: err,
        });
    }
};

// function handleUpdate(update) {
//   if (update.message) {
//     const msg = update.message;

//     if (msg.new_chat_members) return handleNewUser(msg);
//     if (msg.left_chat_member) return handleUserLeft(msg);
//     if (msg.text && msg.text.startsWith('/')) return handleCommand(msg);
//     if (msg.entities?.some(e => e.type === 'mention')) return handleMention(msg);
//     return handleText(msg);
//   }
// }
