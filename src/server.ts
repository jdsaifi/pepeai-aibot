import app from './app';
import config from './config';
import os from 'os';
import cluster from 'cluster';
import { MongooseConnect } from './library/mongooseConnect';
import { Logger } from './utils/logger';
import bot from './bot';
import { consoleLog } from './utils/consoleLog';
import { connectRabbitMQ } from './library/rabbitmq';

// const botCallbacks = () => {
//     // Here you can attach bot callbacks if needed
//     // For example:
//     // log ctx
//     bot.use((ctx, next) => {
//         console.log('\n\n');
//         console.log('=============== CTX Update ===============');
//         consoleLog.log('asdfasdfasdf');
//         consoleLog.log(ctx?.update);
//         console.log('=============== END CTX Update ===============');
//         return next();
//     });

//     bot.telegram.setMyCommands([
//         {
//             command: '/start',
//             description: 'Start using safu shield bot by adding as admin',
//         },
//     ]);
// };

async function runServer() {
    // Connect to the database
    MongooseConnect()
        .then(() => {
            Logger.info('Database connected successfully');

            app.listen(config.port, async () => {
                // start rabbitmq connection
                await connectRabbitMQ();

                Logger.info(
                    `Server is running @ ${os.hostname()}:${config.port}`
                );
                Logger.info(`Environment: ${config.env}`);

                // // launch the bot
                // bot.launch(() => {
                //     Logger.info(`The ${config.tgBotName} launched.`);
                //     botCallbacks();
                // }).catch((err) => {
                //     console.log('');
                //     console.log('');
                //     console.log('=============================');
                //     console.log('');
                //     console.log('BOT CONNECTION ERROR');
                //     console.log('=============================');
                //     console.log('');

                //     console.error(err);
                // });

                const tgWebhook = await bot.telegram.getWebhookInfo();

                if (!tgWebhook.url) {
                    app.use(
                        await bot.createWebhook({
                            domain: config.telegramWebhookDomain,
                            path: config.telegramWebhookUrl,
                        })
                    );
                }

                // bot.on('text', (ctx) => ctx.reply('Hello'));

                // run rabbitmq consumer
                // runConsumers();
            });
        })
        .catch((error) => {
            Logger.error({
                event: 'Database Connection Error',
                error,
            });
            process.exit(1);
        });
}

if (cluster.isPrimary) {
    // const noCPU: number = config.env == 'development' ? 1 : os.cpus().length;
    const noCPU: number = 2;
    for (let i = 0; i < noCPU; i++) {
        cluster.fork();
    }
} else {
    runServer();
}
