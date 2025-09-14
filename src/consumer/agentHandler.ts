import { getRabbitMQChannel } from '../library/rabbitmq';
import config from '../config';
import { Logger } from '../utils/logger';
import GroupService from '../services/groupService';
import bot from '../bot';
import getAiResponse from '../services/AIService';
import AIMessageLogService from '../services/aiMessageLogService';

const sendMessage = async (
    groupId: string | number,
    text: string,
    messageId?: string,
    threadId?: string
) => {
    const extra: any = {
        parse_mode: 'HTML',
        link_preview_options: {
            is_disabled: true,
        },
    };

    if (messageId) {
        extra.reply_parameters = {
            message_id: messageId,
        };
    }

    if (threadId) {
        extra.message_thread_id = threadId;
    }

    await bot.telegram.sendMessage(
        groupId,
        `${text}\n\n${config.brandUsername}`
    );
};

const processMessage = async (message: any) => {
    //{"groupId":-4714730331,"senderId":1365355482,"messageText":"hey admin here?", "messageId": 11, messageLogId: "64b8f7e2c9e77c001f6e4b8a"}

    if (!('groupId' in message)) {
        Logger.error({
            event: 'Invalid message format in processMessage',
            content: message,
        });
        return;
    }

    // todo: get group details
    const groupService = GroupService.getInstance();
    const group = await groupService.getGroupByTgId(message.groupId);
    if (!group) {
        Logger.error({
            event: 'Group not found in processMessage',
            content: message,
        });
        return;
    }

    // todo: get response from ai with kb
    const response: string = await getAiResponse(message.messageText, group);

    // todo: update ai message log with response and success
    const aiMessageLogService = AIMessageLogService.getInstance();
    await aiMessageLogService.updateMessageLogResponse(
        message.messageLogId,
        response
    );

    // todo: send response to user
    sendMessage(group.groupId, response, message?.messageId);
};

async function agentHandler() {
    const channel = await getRabbitMQChannel();
    channel.prefetch(config.rabbitmq.agentWorkerConcurrency);

    channel.consume(
        config.rabbitmq.pendingTgUpdateQueue,
        (msg) => {
            if (msg !== null) {
                const content = msg.content.toString();

                Logger.info({
                    event: 'Message Received in (agentHandler)',
                    content: content,
                });
                // insertMessage(msg);

                let agentMessage = null;

                try {
                    agentMessage = JSON.parse(content);
                } catch (err: any) {
                    Logger.error({
                        event: 'Failed to parse agent message',
                        msg: '[agentHandler] Error parsing agent message. Discarding (to DLQ):',
                        content,
                        error: err,
                    });
                    channel.nack(msg, false, false); // Malformed, send to DLQ
                    return;
                }

                try {
                    // await notificationLimiter(() =>
                    //     sendNotification(notification, bot)
                    // );

                    processMessage(agentMessage);
                    channel.ack(msg);
                    Logger.info({
                        event: 'Success',
                        msg: '[success] Agent response has been sent',
                    });
                } catch (err: any) {
                    Logger.error({
                        event: 'Failed to process message',
                        error: err,
                    });

                    const xDeathHeader =
                        msg.properties.headers &&
                        msg.properties.headers['x-death'];
                    let retryCount = 0;
                    if (
                        xDeathHeader &&
                        Array.isArray(xDeathHeader) &&
                        xDeathHeader.length > 0
                    ) {
                        // If using delayed exchanges for retries, this count is accurate.
                        // If just NACKing to the same queue, RabbitMQ doesn't track retries this way directly
                        // without a more complex setup (e.g., manually adding a retry count to message properties).
                        // For DLX based retries, 'count' in x-death is the number of times it's been dead-lettered.
                        retryCount = xDeathHeader[0].count || 0;
                    }
                    // Fallback: if you were adding a custom header for retries, you'd read it here.

                    // if (retryCount < MAX_NOTIFICATION_RETRIES) {
                    //     Logger.warn(
                    //         `[NotificationWorker] Requeuing notification for ${
                    //             notification.signature
                    //         } (attempt ${retryCount + 1})`
                    //     );
                    //     // To implement delayed retry, you'd NACK to a DLX that routes back to the main queue after a TTL.
                    //     // For simplicity here, we'll NACK to requeue (if queue isn't configured for immediate DLX on NACK).
                    //     // If PENDING_NOTIFICATIONS_QUEUE is configured with a DLX, nack(requeue=false) goes to DLX.
                    //     // For a simple retry to the same queue (less ideal for repeated errors):
                    //     // channel.nack(msg, false, true);
                    //     // For robust retry with backoff, use a DLX with TTLs and route back to PENDING_NOTIFICATIONS_QUEUE
                    //     // For now, assume DLX handles failures and we won't requeue to the same queue indefinitely.
                    //     channel.nack(msg, false, false); // Send to DLQ (or DLX configured for retry if setup that way)
                    // } else {
                    //     Logger.error(
                    //         `[NotificationWorker] Max retries (${MAX_NOTIFICATION_RETRIES}) reached for ${notification.signature}. Moving to final DLQ.`
                    //     );
                    //     channel.nack(msg, false, false); // Send to final DLQ
                    // }
                }

                Logger.info('\n');
                // channel.ack(msg);
            }
        },
        { noAck: false }
    );
}
export default agentHandler;
