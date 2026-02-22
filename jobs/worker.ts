import 'dotenv/config';
import { setupCampanhaWorker } from '../src/lib/campanhas/worker';

console.log('🚀 Iniciando Worker de WhatsApp...');

const worker = setupCampanhaWorker();

process.on('SIGTERM', async () => {
    console.log('Shutting down worker...');
    await worker.close();
    process.exit(0);
});
