import { Telegraf } from 'telegraf';
import config from './config';
// import { consoleLog } from './utils/consoleLog';
// import { Logger } from './utils/logger';

if (!config.tgBotToken) throw new Error('bot token is required!');

const bot = new Telegraf(config.tgBotToken);
// {
//     handlerTimeout: 9_000_000,
// }

// (async () => {
//     const rs = await bot.telegram.getWebhookInfo();
//     consoleLog.log('webhook info:', rs);
// })();

// const botCallbacks = () => {
//     // Here you can attach bot callbacks if needed
//     // For example:
//     // log ctx
//     bot.use((ctx, next) => {
//         consoleLog.log('\n\n');
//         consoleLog.log('=============== CTX Update ===============');
//         consoleLog.log(ctx?.update);
//         consoleLog.log('=============== END CTX Update ===============');
//         return next();
//     });

//     bot.telegram.setMyCommands([
//         {
//             command: '/start',
//             description: 'Start using safu shield bot by adding as admin',
//         },
//     ]);
// };

// const launchBot = async () => {
//     try {
//         consoleLog.log('Launching bot...');
//         bot.launch();
//         Logger.info(`The ${config.tgBotName} launched.`);
//         botCallbacks();
//         consoleLog.log(`Bot ${config.tgBotName} launched successfully.`);

//         const rsSetWebhook = await bot.telegram.setWebhook(
//             'https://5909d0e94926.ngrok-free.app/webhook'
//         );
//         consoleLog.log('Webhook set:', rsSetWebhook);
//         // Uncomment the line below to set a specific webhook URL
//         // (
//         //     'https://5909d0e94926.ngrok-free.app/webhook'
//         // );

//         const rs = await bot.telegram.getWebhookInfo();
//         consoleLog.log('webhook info:', rs);
//         // consoleLog.log(`Webhook set for bot ${config.tgBotName}.`);
//     } catch (error) {
//         consoleLog.log('');
//         consoleLog.log('');
//         consoleLog.log('=============================');
//         consoleLog.log('');
//         consoleLog.log('BOT CONNECTION ERROR');
//         consoleLog.log('=============================');
//         consoleLog.log('');

//         consoleLog.error(error);

//         process.exit(1);
//     }
// };
// launchBot()
//     .then(() => {
//         Logger.info(`Bot ${config.tgBotName} is running.`);
//     })
//     .catch((error) => {
//         Logger.error({
//             event: 'Bot Launch Error',
//             error,
//         });
//     });

export default bot;
