import { Link } from '@inertiajs/react';

interface AppLogoProps {
    asLink?: boolean;
    href?: string;
    className?: string;
}

export default function AppLogo({ asLink = true, href = "/", className = "" }: AppLogoProps) {
    const logoElement = (
        <div className={` text-sidebar-primary-foreground flex items-center justify-center rounded-md ${className}`}>
            <img src="/images/logo/Astroworks.svg" alt="Astro Works Logo" className="h-4" />
        </div>
    );

    if (asLink) {
        return (
            <Link href={href}>
                {logoElement}
            </Link>
        );
    }

    return logoElement;
}
