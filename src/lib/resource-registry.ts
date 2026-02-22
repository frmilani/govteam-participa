/**
 * HPAC Resource Registry - Premio-Destaque
 * 
 * Defines all resources this spoke exposes to the Hub HPAC system.
 * Called on app startup to register resources in the Hub's Resource Registry.
 */

const HUB_URL = process.env.HUB_INTERNAL_URL || process.env.HUB_URL || 'http://localhost:3000'
const SPOKE_ID = process.env.HUB_CLIENT_ID || 'premio-destaque'
const SPOKE_SECRET = process.env.HUB_CLIENT_SECRET || ''

export const SPOKE_RESOURCES = [
  {
    resource: 'enquete',
    displayName: 'Enquetes',
    description: 'Pesquisas e enquetes de satisfação',
    actions: ['list', 'create', 'read', 'update', 'delete', 'publish'],
    icon: 'clipboard-list',
  },
  {
    resource: 'campanha',
    displayName: 'Campanhas',
    description: 'Campanhas de votação e premiação',
    actions: ['list', 'create', 'read', 'update', 'delete'],
    icon: 'trophy',
  },
  {
    resource: 'lead',
    displayName: 'Leads',
    description: 'Contatos e leads capturados',
    actions: ['list', 'create', 'read', 'update', 'delete', 'export'],
    icon: 'users',
  },
  {
    resource: 'segmento',
    displayName: 'Segmentos',
    description: 'Segmentos de categorização',
    actions: ['list', 'create', 'read', 'update', 'delete'],
    icon: 'tags',
  },
  {
    resource: 'estabelecimento',
    displayName: 'Estabelecimentos',
    description: 'Estabelecimentos participantes',
    actions: ['list', 'create', 'read', 'update', 'delete'],
    icon: 'store',
  },
  {
    resource: 'voto',
    displayName: 'Votos',
    description: 'Votos registrados nas campanhas',
    actions: ['list', 'read', 'export'],
    icon: 'vote',
  },
]

export async function registerResources(): Promise<void> {
  if (!SPOKE_SECRET) {
    console.warn('[Resource Registry] HUB_CLIENT_SECRET not set, skipping registration')
    return
  }

  try {
    const res = await fetch(`${HUB_URL}/api/v1/resources`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-spoke-id': SPOKE_ID,
        'x-spoke-secret': SPOKE_SECRET,
      },
      body: JSON.stringify({
        spokeId: 'premio-destaque',
        resources: SPOKE_RESOURCES,
      }),
    })

    if (res.ok) {
      const data = await res.json()
      console.log(`[Resource Registry] Registered ${data.registered} resources for premio-destaque`)
    } else {
      console.error(`[Resource Registry] Failed: ${res.status} ${res.statusText}`)
    }
  } catch (error) {
    console.error('[Resource Registry] Error registering resources:', error)
  }
}
