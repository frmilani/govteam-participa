import { Metadata } from 'next';
import { TrackingLinkService } from "@/lib/tracking/tracking-link-service";

type Props = {
    params: Promise<{ hash: string }>;
};

export async function generateMetadata(
    { params }: Props
): Promise<Metadata> {
    try {
        const { hash } = await params;
        const link = await TrackingLinkService.getValidLink(hash);

        if (!link) {
            return {
                title: 'Votação Online | Participa',
                description: 'Participe da nossa pesquisa e deixe sua opinião.',
            };
        }

        const enquete = (link as any).campanha?.enquete;
        const configVisual = (enquete?.configVisual as any) || {};

        const title = enquete?.titulo || 'Votação Online';
        const description = enquete?.descricao || 'Participe da nossa pesquisa e deixe sua opinião.';
        const image = configVisual.bannerUrl || configVisual.logoUrl || '';

        return {
            title: `${title} | Participa`,
            description,
            openGraph: {
                title,
                description,
                images: image ? [{ url: image, width: 1200, height: 630, alt: title }] : [],
                type: 'website',
            },
            twitter: {
                card: 'summary_large_image',
                title,
                description,
                images: image ? [image] : [],
            },
        };
    } catch (error) {
        return {
            title: 'Votação Online',
            description: 'Participe da nossa pesquisa.',
        };
    }
}

export default function VoteLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
