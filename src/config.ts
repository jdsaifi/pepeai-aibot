import path from 'path';
import dotenv from 'dotenv';
dotenv.config({
    path: path.join(__dirname, './.env'),
});

const config = {
    env: process.env.ENV || 'development',
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3100,
    host: process.env.HOST || 'localhost',
    isSecure: process.env.ENV === 'production' ? true : false,
    domain: process.env.DOMAIN || 'pepeaiagent.com',
    brandUsername: process.env.BRAND_USERNAME || '@pepeaibot',
    mongoUri: process.env.DB_URL || 'mongodb://localhost:27017',
    mongoDbName: process.env.DB_NAME || 'pepeai_agent',
    tgBotToken: process.env.TG_BOT_TOKEN || null,
    tgBotUsername: process.env.TG_BOT_USERNAME || 'SafuShieldTestBot',
    tgBotName: process.env.TG_BOT_NAME || 'Safu Shield Test Bot',
    enable_logs: process.env.ENABLE_DEBUG_LOGS || false,
    telegramWebhookUrl:
        process.env.TELEGRAM_WEBHOOK_URL ||
        'https://your-webhook-url.com/webhook',
    telegramWebhookDomain:
        process.env.TELEGRAM_WEBHOOK_DOMAIN ||
        'https://your-webhook-domain.com',
    rabbitmq: {
        url: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
        queueName: process.env.RABBITMQ_QUEUE_NAME || 'pepeai_queue',
        telegramUpdateExchange: 'telegram_update_fanout_exchange',
        tgUpdateExchange: 'telegram_update_exchange',
        tgUpdateQueue: 'telegram_update_queue',
        failedTgUpdateDlx: 'failed_tg_update_dlx',
        failedTgUpdateDlq: 'failed_tg_update_dlq',
        pendingTgUpdateQueue: 'pending_tg_update_queue',
        agentWorkerConcurrency: 5,
    },
    openRouter: {
        url: 'https://openrouter.ai/api/v1',
        key: process.env.OPENROUTER_API_KEY || '',
    },
    jwt: {
        exp: process.env.JWT_EXP || '8h', // 8 hours
        secret: process.env.JWT_SECRET || 'generateUniqueID_(_32_)',
    },
};

export default config;
