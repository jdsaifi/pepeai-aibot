export const corsOptions = {
    origin: [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://localhost:3044',
        'http://localhost:8080',
        'http://localhost:8081',
        'https://pepeai.saifisolutions.com',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // Specify allowed methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Specify allowed headers
};
