export default () => ({
    MONGO: { URI: process.env.MONGO_URI },
    AIRING_CRON_SCHEDULE: process.env.AIRING_CRON_SCHEDULE,
    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PORT: process.env.REDIS_PORT,
    REDIS_USER: process.env.REDIS_USER,
    REDIS_PASSWORD: process.env.REDIS_PASSWORD,
    NYAA_TORRENT_COLLECTOR_JOB_ATTEMPTS: process.env.NYAA_TORRENT_COLLECTOR_JOB_ATTEMPTS,
    NYAA_TORRENT_COLLECTOR_JOB_BACKOFF_TYPE: process.env.NYAA_TORRENT_COLLECTOR_JOB_BACKOFF_TYPE,
    NYAA_TORRENT_COLLECTOR_JOB_BACKOFF_delay: process.env.NYAA_TORRENT_COLLECTOR_JOB_BACKOFF_delay,
    BULLBOARD_ADMIN_PASSWORD: process.env.BULLBOARD_ADMIN_PASSWORD,
})