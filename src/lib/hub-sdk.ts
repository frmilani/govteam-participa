import { HubPermissions } from '@frmilani/hub-permissions'

const HUB_URL = process.env.HUB_INTERNAL_URL || process.env.HUB_URL;
const HUB_CLIENT_ID = process.env.HUB_CLIENT_ID;
const HUB_CLIENT_SECRET = process.env.HUB_CLIENT_SECRET;

/**
 * Hub Permissions SDK Instance
 * Replaces manual HubApiService for security and authorization checks.
 */
export const hubPermissions = new HubPermissions({
    hubUrl: HUB_URL!,
    spokeId: HUB_CLIENT_ID,
    spokeSecret: HUB_CLIENT_SECRET,
    cacheTTL: 300, // 5 minutes
})
