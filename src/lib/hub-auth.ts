import { NextRequest } from "next/server";

const SPOKE_SECRET = process.env.HUB_CLIENT_SECRET;

/**
 * Validates incoming Hub→Spoke requests.
 * The Hub sends x-spoke-secret to authenticate itself to the spoke.
 */
export function validateHubRequest(req: NextRequest) {
    const incomingSecret = req.headers.get("x-spoke-secret") || req.headers.get("x-api-key");

    if (!SPOKE_SECRET) {
        console.error("[HUB_AUTH] HUB_CLIENT_SECRET não configurada no ambiente!");
        return false;
    }

    // Permite 'demo-key' em desenvolvimento se configurado
    if (process.env.NODE_ENV === 'development' && incomingSecret === 'demo-key') {
        return true;
    }

    return incomingSecret === SPOKE_SECRET;
}

/** @deprecated Use validateHubRequest instead */
export const validateHubApiKey = validateHubRequest;

export function getOrganizationIdFromHeader(req: NextRequest) {
    return req.headers.get("x-organization-id") || req.nextUrl.searchParams.get("organizationId");
}
