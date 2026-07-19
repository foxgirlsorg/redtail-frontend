import { getTeamMembersAll, getFooter } from '@/lib/strapiClient';
import { Footer } from '@/components/Footer/Footer';
import TeamCardClient from './TeamCardClient';

const STRAPI_DOMAIN = process.env.NEXT_PUBLIC_STRAPI_DOMAIN;

export const dynamic = 'force-dynamic';


export default async function TeamCardPage() {
    const [team, footer] = await Promise.all([getTeamMembersAll(), getFooter()]);
    return (
        <>
            <TeamCardClient team={team as any} strDomain={STRAPI_DOMAIN} />
            <Footer footer={footer} strDomain={STRAPI_DOMAIN} />
        </>
    );
}
