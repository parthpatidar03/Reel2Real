const { Queue } = require('bullmq');
const Redis = require('ioredis');

// Create Redis connection
const connection = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    maxRetriesPerRequest: null
});

// Create queue
const reelProcessingQueue = new Queue('reel-processing', {
    connection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 60000 // Start with 1 minute
        },
        removeOnComplete: {
            age: 3600 // Keep completed jobs for 1 hour
        },
        removeOnFail: {
            age: 86400 // Keep failed jobs for 24 hours
        }
    }
});

/**
 * Add job to queue
 */
const addJobToQueue = async (jobType, data) => {
    try {
        const job = await reelProcessingQueue.add(jobType, data, {
            priority: 1
        });

        console.log(`Job ${job.id} added to queue: ${jobType}`);
        return job;
    } catch (error) {
        console.error('Error adding job to queue:', error);
        throw error;
    }
};

/**
 * Get job status
 */
const getJobStatus = async (jobId) => {
    try {
        const job = await reelProcessingQueue.getJob(jobId);

        if (!job) {
            return null;
        }

        const state = await job.getState();
        const progress = job.progress;

        return {
            id: job.id,
            state,
            progress,
            data: job.data,
            returnvalue: job.returnvalue,
            failedReason: job.failedReason
        };
    } catch (error) {
        console.error('Error getting job status:', error);
        throw error;
    }
};

module.exports = {
    reelProcessingQueue,
    addJobToQueue,
    getJobStatus,
    connection
};
