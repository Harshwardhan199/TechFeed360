import dotenv from 'dotenv';
import cron from 'node-cron';
import connectDB from './config/db';
import { generateArticles } from './services/articleGenerator';

dotenv.config();

const start = async () => {
    await connectDB();

    console.log('Automation Service Started');

    // Run once at server start
    console.log('Running initial automation pipeline...');
    await generateArticles();

    // Then run every hour
    cron.schedule(
        '0 * * * *',
        async () => {
            console.log('Running automation pipeline (cron)...');
            await generateArticles();
        },
        {
            timezone: 'Asia/Kolkata',
        }
    );
};

start().catch((err) => {
    console.error('Failed to start automation service:', err);
    process.exit(1);
});

