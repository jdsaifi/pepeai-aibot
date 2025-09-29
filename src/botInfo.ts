import bot from './bot';
import { consoleLog } from './utils/consoleLog';
import { Logger } from './utils/logger';

async function main() {
    // const rs = await bot.telegram.getWebhookInfo();
    // consoleLog.log('webhook info:', rs);

    const groupInfo = await bot.telegram.getChat(-1002987867014);
    consoleLog.log('group info:', groupInfo);

    // const memberCount = await bot.telegram.getChatMembersCount(-1002987867014);
    // consoleLog.log('member count:', memberCount);

    const admins = await bot.telegram.getChatAdministrators(-1002987867014);
    consoleLog.log('admins:', admins);

    const creator = admins.find((admin) => admin.status === 'creator');
    consoleLog.log('creator:', creator);

    // const botMember = await bot.telegram.getChatMember(
    //     -1002987867014,
    //     7584561322
    // );
    // consoleLog.log('bot member info:', botMember);
}

main().catch((error) => {
    Logger.error({
        event: 'Main Execution Error for botInfo.ts',
        error: error,
    });
});
