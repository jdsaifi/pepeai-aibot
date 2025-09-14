import config from '../config';
import { Logger } from '../utils/logger';
import mongoose from 'mongoose';
// mongoose events
mongoose.connection.on('connected', function () {
    Logger.info('[Mongoose connected]');
});

mongoose.connection.on('error', function (err) {
    Logger.error('[Mongoose connection has occured error]', err);
});

mongoose.connection.on('disconnected', function () {
    Logger.warn('[Mongoose connection is disconnected]');
});

export const MongooseConnect = async () => {
    try {
        console.log('mongo: ', config.mongoUri, config.mongoDbName);
        const connectionInstance = await mongoose.connect(
            config.mongoUri as string,
            {
                dbName: config.mongoDbName,
            }
        );
        Logger.info(
            `Mongoose Connection Hosted @ ${connectionInstance.connection.host}`
        );
    } catch (err) {
        Logger.error('[Mongoose connection failed]', err);
        process.exit(1);
    }
};
