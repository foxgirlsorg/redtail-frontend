import { getTeamMembersAll } from '@/lib/strapiClient';
import TeamCardClient from './TeamCardClient';

const STRAPI_DOMAIN = process.env.NEXT_PUBLIC_STRAPI_DOMAIN;

export const dynamic = 'force-dynamic';


export default async function TeamCardPage() {
    const team = await getTeamMembersAll();
    return <TeamCardClient team={team as any} strDomain={STRAPI_DOMAIN} />;
}