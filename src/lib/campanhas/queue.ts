import { Queue } from 'bullmq';
import { redis } from '../redis';

export const CAMPANHA_QUEUE_NAME = 'campanha-whatsapp';

export const campanhaQueue = new Queue(CAMPANHA_QUEUE_NAME, {
    connection: redis as any,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000,
        },
        removeOnComplete: true,
    },
});

export interface CampanhaJobData {
    trackingLinkId: string;
    campanhaId: string;
    mensagens: any[];
    organizationId: string;
    strategy?: 'DIRECT' | 'SOFT_BLOCK' | 'OPT_IN';
    initialMessage?: string;
    stage?: 'INITIAL' | 'FULFILLMENT';
}
