import runConsumers from './consumer';
import { Logger } from './utils/logger';

async function main() {
    runConsumers();
}
main().catch((error) => {
    Logger.error({
        event: 'Main Execution Error for startConsumers.ts',
        error: error,
    });
});
