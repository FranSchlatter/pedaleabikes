"use client";

import Image from "next/image";
import { useState } from "react";
import { PlayIcon } from "@/components/ui/Icons";
import type { VideoItem } from "@/types";

type LazyVideoProps = {
    video: VideoItem;
    available: boolean;
};

// No se descarga nada del video hasta que el usuario toca play (y ahí arranca con sonido porque
// fue una acción explícita). Antes solo se ve el poster optimizado por next/image.
export function LazyVideo({ video, available }: LazyVideoProps) {
    const [active, setActive] = useState(false);

    if (active) {
        return (
            <video
                className="absolute inset-0 size-full bg-ink object-cover"
                src={video.src}
                poster={video.poster}
                controls
                autoPlay
                playsInline
                preload="none"
            />
        );
    }

    return (
        <button
            type="button"
            disabled={!available}
            onClick={function () {
                setActive(true);
            }}
            className="group/video absolute inset-0 size-full text-left disabled:cursor-not-allowed"
            aria-label={
                available ? `Reproducir video: ${video.title}` : `${video.title} (próximamente)`
            }
        >
            <Image
                src={video.poster}
                alt=""
                fill
                sizes="(min-width: 1024px) 30vw, 80vw"
                className="object-cover transition-transform duration-700 ease-out-expo group-hover/video:scale-105"
            />
            <span className="absolute inset-0 bg-linear-to-t from-ink via-ink/20 to-transparent" />
            <span className="absolute inset-0 m-auto flex size-20 items-center justify-center rounded-full bg-chalk/15 text-chalk ring-1 ring-chalk/40 backdrop-blur-md transition-transform duration-500 ease-out-expo group-hover/video:scale-110 group-enabled/video:group-hover/video:bg-accent group-enabled/video:group-hover/video:text-ink">
                <PlayIcon className="ml-1 size-8" />
            </span>
            {!available && (
                <span className="absolute right-4 top-4 rounded-full bg-ink/80 px-3 py-1 text-xs font-bold uppercase tracking-wider text-lime">
                    Próximamente
                </span>
            )}
            <span className="absolute inset-x-0 bottom-0 p-6">
                <span className="heading-display block text-3xl text-chalk">{video.title}</span>
                <span className="mt-1 block text-sm text-chalk/75">{video.description}</span>
            </span>
        </button>
    );
}
