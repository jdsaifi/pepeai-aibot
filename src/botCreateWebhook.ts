import bot from './bot';
import config from './config';
import { consoleLog } from './utils/consoleLog';
import { Logger } from './utils/logger';

async function main() {
    const rs = await bot.telegram.setWebhook(config.telegramWebhookDomain);
    consoleLog.log('setWebhook info:', rs);
}

main().catch((error) => {
    Logger.error({
        event: 'Main Execution Error for botInfo.ts',
        error: error,
    });
});
