"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

type HeroVideoProps = {
    src: string;
    poster: string;
};

type NavigatorWithConnection = Navigator & {
    connection?: { saveData?: boolean };
};

function playVideo(video: HTMLVideoElement) {
    video.play().catch(function () {
        // Autoplay bloqueado (p. ej. modo ahorro de batería en iOS): queda el poster.
    });
}

function shouldSkipVideo() {
    const nav = navigator as NavigatorWithConnection;
    return Boolean(nav.connection?.saveData);
}

// El poster (renderizado por el server) es el LCP; el video arranca recién cuando el navegador
// está ocioso, y no arranca con reduced-motion ni con "ahorro de datos".
export function HeroVideo({ src, poster }: HeroVideoProps) {
    const ref = useRef<HTMLVideoElement>(null);
    const reduceMotion = useReducedMotion();
    const [playing, setPlaying] = useState(false);

    useEffect(
        function () {
            const video = ref.current;
            if (!video || reduceMotion || shouldSkipVideo()) {
                return;
            }
            const start = playVideo.bind(null, video);
            if (typeof window.requestIdleCallback === "function") {
                const id = window.requestIdleCallback(start, { timeout: 2500 });
                return function () {
                    window.cancelIdleCallback(id);
                };
            }
            // Safari no tiene requestIdleCallback.
            const timeout = setTimeout(start, 1200);
            return function () {
                clearTimeout(timeout);
            };
        },
        [reduceMotion],
    );

    return (
        <video
            ref={ref}
            className={`absolute inset-0 size-full object-cover transition-opacity duration-1000 ${
                playing ? "opacity-100" : "opacity-0"
            }`}
            muted
            loop
            playsInline
            preload="none"
            poster={poster}
            aria-hidden
            tabIndex={-1}
            onPlaying={function () {
                setPlaying(true);
            }}
        >
            <source src={src} type="video/mp4" />
        </video>
    );
}
