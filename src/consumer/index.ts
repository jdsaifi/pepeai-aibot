import consumeMessageHandler from './messageHandler';
import consumeGroupHandler from './groupHandler';
import consumeMessageForAIHandler from './messageForAIHandler';
import agentHandler from './agentHandler';
import { Logger } from '../utils/logger';
import { MongooseConnect } from '../library/mongooseConnect';

const runConsumers = async () => {
    MongooseConnect()
        .then(() => {
            // message handler
            consumeMessageHandler().catch((error: any) => {
                Logger.error({
                    event: 'Consumer Error in consumeMessageHandler',
                    error: error,
                });
            });

            // group handler
            consumeGroupHandler().catch((error) => {
                Logger.error({
                    event: 'Consumer Error in consumeGroupHandler',
                    error: error,
                });
            });

            // message for agent handler
            consumeMessageForAIHandler().catch((error) => {
                Logger.error({
                    event: 'Consumer Error in consumeMessageForAIHandler',
                    error: error,
                });
            });

            // agent handler
            agentHandler().catch((error) => {
                Logger.error({
                    event: 'Consumer Error in agentHandler',
                    error: error,
                });
            });
        })
        .catch((err) => {
            Logger.error('Error connecting to MongoDB:', err);
        });
};

export default runConsumers;
