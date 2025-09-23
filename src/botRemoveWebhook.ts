import bot from './bot';
import { consoleLog } from './utils/consoleLog';
import { Logger } from './utils/logger';

async function main() {
    const rs = await bot.telegram.deleteWebhook();
    consoleLog.log('webhook removed:', rs);
}

main().catch((error) => {
    Logger.error({
        event: 'Main Execution Error for botRemoveWebhook.ts',
        error: error,
    });
});
