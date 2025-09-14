import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morganMiddleware from './middleware/morgan';
// import responseFormatter from './middleware/response';
// import errorHandler from './middleware/error';
import { Logger } from './utils/logger';
import { corsOptions } from './utils/corsOptions';
import path from 'path';
import bot from './bot';

import routes from './routes';

const app: Express = express();

app.use(cors(corsOptions));
// Explicitly handle OPTIONS requests (preflight)
// app.options('*', cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(helmet());
app.use(cookieParser());

/** middlewares */
app.use(morganMiddleware);
// app.use(responseFormatter);

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.on('error', (error) => {
    Logger.error({
        event: 'App Error',
        error,
    });
    throw error;
});

app.get('/healthcheck', (req, res) => {
    console.log('Healthcheck endpoint hit');
    res.status(200).json({
        status: 'ok',
        message: 'API is running',
        dt: new Date().toISOString(),
    });
});

app.get('/', (req, res) => {
    console.log('Received a request at /');
    res.send('Welcome!');
});

// Register routes
app.use('/', routes);

// app.post(
//     '/telegraf/84918fbb3e91726f9b5ba85aa5bcb8cbcc8b4a37cff60c605ca9bc0c1ea166dc',
//     (req: Request, res: Response) => {
//         console.log('Received a webhook request');
//         // Handle the webhook request here
//         console.log('Webhook request body:', req.body);

//         bot.telegram
//             .sendMessage(req.body.message.chat.id, 'Hello from the webhook!', {
//                 parse_mode: 'HTML',
//                 reply_parameters: {
//                     message_id: req.body.message.message_id,
//                 },
//             })
//             .catch((error) => {
//                 Logger.error({
//                     event: 'Webhook Error',
//                     error,
//                 });
//             });
//         res.status(200).json({
//             status: 'ok',
//             message: 'Webhook received',
//             dt: new Date().toISOString(),
//         });
//     }
// );

/** error handler middleware */
// app.use(errorHandler);

/** unhandeled error */
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    // log error
    Logger.error({
        event: 'Unhandled Error',
        error: err,
        request: {
            method: req.method,
            url: req.url,
            body: req.body,
            headers: req.headers,
        },
    });
    // Handle the error
    res.status(500).json({
        status: 'error',
        error: {
            code: 500,
            messages: ['Internal server error.', err?.message],
        },
        metadata: {
            timestamp: new Date().toISOString(),
        },
    });
});

export default app;
