export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const { registerResources } = await import('./lib/resource-registry');
        await registerResources();
        console.log('[HPAC] Autoregistering Spoke resources into Hub...');
    }
}
