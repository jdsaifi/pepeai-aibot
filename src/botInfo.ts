import bot from './bot';
import { consoleLog } from './utils/consoleLog';
import { Logger } from './utils/logger';

async function main() {
    const rs = await bot.telegram.getWebhookInfo();
    consoleLog.log('webhook info:', rs);
}

main().catch((error) => {
    Logger.error({
        event: 'Main Execution Error for botInfo.ts',
        error: error,
    });
});
