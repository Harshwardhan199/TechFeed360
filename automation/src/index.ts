import dotenv from 'dotenv';
import cron from 'node-cron';
import connectDB from './config/db';
import { harvestCandidates, processQueue } from './services/articleGenerator';
import Article from './models/Article';

dotenv.config();

const PROCESS_QUEUE_WINDOW_MINUTES = 10;

const startRandomProcessQueueScheduler = () => {
    const scheduleNextRun = () => {
        const minMs = 3 * 60 * 1000;
        const maxMs = PROCESS_QUEUE_WINDOW_MINUTES * 60 * 1000;
        const delay = minMs + Math.floor(Math.random() * (maxMs - minMs));

        console.log(
            `⏱  Next random processQueue run in ~${Math.round(delay / 1000)} seconds`
        );

        setTimeout(async () => {
            try {
                console.log('⏰ Random: Processing queue...');
                await processQueue();
            } catch (err) {
                console.error('Error in processQueue:', err);
            } finally {
                // Schedule the next random run after this one completes
                scheduleNextRun();
            }
        }, delay);
    };

    // Kick off the first random run
    scheduleNextRun();
};

const start = async () => {
    await connectDB();

    console.log('Automation Service Started');

    // Run once at server start to ensure things are working
    console.log('Running initial checks...');
    await harvestCandidates();
    await processQueue();

    // 1. Harvest Candidates: Every 30 minutes (fixed schedule)
    cron.schedule(
        '*/30 * * * *',
        async () => {
            console.log('⏰ Cron: Harvesting candidates...');
            try {
                // Find one queued article (oldest first)
                const candidate = await Article.findOne({ status: 'queued' }).sort({ createdAt: 1 });

                if (!candidate) {
                    console.log('Queue is empty. Harvesting candidates...');
                    await harvestCandidates();
                }
                else {
                    console.log('Queue is not empty. Processing queue...');
                }

            } catch (err) {
                console.error('Error in harvestCandidates:', err);
            }
        },
        { timezone: 'Asia/Kolkata' }
    );

    // 2. Process Queue: Randomly within each ~10-minute window
    //    Instead of cron "*/10 * * * *", we use a random setTimeout loop.
    startRandomProcessQueueScheduler();
};

start().catch((err) => {
    console.error('Failed to start automation service:', err);
    process.exit(1);
});





// import dotenv from 'dotenv';
// import cron from 'node-cron';
// import connectDB from './config/db';
// import { harvestCandidates, processQueue } from './services/articleGenerator';

// dotenv.config();

// const start = async () => {
//     await connectDB();

//     console.log('Automation Service Started');

//     // Run once at server start to ensure things are working
//     console.log('Running initial checks...');
//     await harvestCandidates();
//     await processQueue();

//     // 1. Harvest Candidates: Every 30 minutes
//     //    "*/30 * * * *"
//     cron.schedule(
//         '*/30 * * * *',
//         async () => {
//             console.log('⏰ Cron: Harvesting candidates...');
//             await harvestCandidates();
//         },
//         { timezone: 'Asia/Kolkata' }
//     );

//     // 2. Process Queue: Every 10 minutes
//     //    "*/10 * * * *"
//     //    This ensures we process ~6 articles/hour = ~144/day, which fits the 100-200 goal.
//     cron.schedule(
//         '*/10 * * * *',
//         async () => {
//             console.log('⏰ Cron: Processing queue...');
//             await processQueue();
//         },
//         { timezone: 'Asia/Kolkata' }
//     );
// };

// start().catch((err) => {
//     console.error('Failed to start automation service:', err);
//     process.exit(1);
// });
