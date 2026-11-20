import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function base(props: IconProps) {
    return {
        width: 24,
        height: 24,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round" as const,
        strokeLinejoin: "round" as const,
        "aria-hidden": true,
        ...props,
    };
}

export function WhatsAppIcon(props: IconProps) {
    return (
        <svg viewBox="0 0 24 24" width={24} height={24} fill="currentColor" aria-hidden {...props}>
            <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.47-.88-.79-1.47-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.14-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.23 1.36.2 1.87.12.57-.09 1.75-.72 2-1.41.25-.69.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35M12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.32l-.34-.2-3.56.93.95-3.47-.22-.36a9.38 9.38 0 0 1-1.44-5.01c0-5.19 4.23-9.41 9.43-9.41a9.36 9.36 0 0 1 6.66 2.76 9.35 9.35 0 0 1 2.76 6.66c0 5.19-4.23 9.42-9.43 9.42m8.02-17.44A11.27 11.27 0 0 0 12.05.75C5.8.75.7 5.84.7 12.1c0 2 .52 3.95 1.52 5.67L.6 23.25l5.61-1.47a11.3 11.3 0 0 0 5.84 1.49c6.25 0 11.35-5.09 11.35-11.35 0-3.03-1.18-5.88-3.33-8.03" />
        </svg>
    );
}

export function InstagramIcon(props: IconProps) {
    return (
        <svg {...base(props)}>
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
        </svg>
    );
}

export function ArrowRightIcon(props: IconProps) {
    return (
        <svg {...base(props)}>
            <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
    );
}

export function ArrowUpRightIcon(props: IconProps) {
    return (
        <svg {...base(props)}>
            <path d="M7 17 17 7M8 7h9v9" />
        </svg>
    );
}

export function MapPinIcon(props: IconProps) {
    return (
        <svg {...base(props)}>
            <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" />
            <circle cx="12" cy="9.5" r="2.5" />
        </svg>
    );
}

export function ClockIcon(props: IconProps) {
    return (
        <svg {...base(props)}>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
        </svg>
    );
}

export function CheckIcon(props: IconProps) {
    return (
        <svg {...base(props)}>
            <path d="m5 12 4.5 4.5L19 7" />
        </svg>
    );
}

export function StarIcon(props: IconProps) {
    return (
        <svg viewBox="0 0 24 24" width={24} height={24} fill="currentColor" aria-hidden {...props}>
            <path d="m12 2.8 2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3-4.6-4.4 6.3-.9L12 2.8Z" />
        </svg>
    );
}

export function PlayIcon(props: IconProps) {
    return (
        <svg viewBox="0 0 24 24" width={24} height={24} fill="currentColor" aria-hidden {...props}>
            <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" />
        </svg>
    );
}

export function MenuIcon(props: IconProps) {
    return (
        <svg {...base(props)}>
            <path d="M4 7h16M4 12h16M4 17h10" />
        </svg>
    );
}

export function CloseIcon(props: IconProps) {
    return (
        <svg {...base(props)}>
            <path d="M6 6l12 12M18 6 6 18" />
        </svg>
    );
}

export function WrenchIcon(props: IconProps) {
    return (
        <svg {...base(props)}>
            <path d="M14.7 6.3a4 4 0 0 0-5.4 5.2L3 17.8V21h3.2l6.3-6.3a4 4 0 0 0 5.2-5.4l-2.6 2.6-2.4-.5-.5-2.4 2.5-2.7Z" />
        </svg>
    );
}

export function ChatIcon(props: IconProps) {
    return (
        <svg {...base(props)}>
            <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-4.9A8 8 0 1 1 21 12Z" />
            <path d="M8.5 11h7M8.5 14h4" />
        </svg>
    );
}

export function BikeIcon(props: IconProps) {
    return (
        <svg {...base(props)}>
            <circle cx="5.5" cy="16.5" r="3.5" />
            <circle cx="18.5" cy="16.5" r="3.5" />
            <path d="M5.5 16.5 9 9h6l3.5 7.5M9 9l3 7.5L15 9M8 6h3M15 9l-1-3h2.5" />
        </svg>
    );
}

export function BellIcon(props: IconProps) {
    return (
        <svg {...base(props)}>
            <path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15L6 16Z" />
            <path d="M10 20.5a2 2 0 0 0 4 0" />
        </svg>
    );
}

export function WheelIcon(props: IconProps) {
    return (
        <svg {...base(props)}>
            <circle cx="12" cy="12" r="9.5" />
            <circle cx="12" cy="12" r="1.8" fill="currentColor" />
            <path
                d="M12 2.5v7.7M12 13.8v7.7M2.5 12h7.7M13.8 12h7.7M5.3 5.3l5.4 5.4M13.3 13.3l5.4 5.4M18.7 5.3l-5.4 5.4M10.7 13.3l-5.4 5.4"
                strokeWidth="1.2"
            />
        </svg>
    );
}
