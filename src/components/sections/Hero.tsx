import { getImageProps } from "next/image";
import { ArrowRightIcon, WrenchIcon } from "@/components/ui/Icons";
import { publicFileExists } from "@/lib/media";
import type { DaySchedule, HeroContent } from "@/types";
import { HeroCta } from "./HeroCta";
import { HeroTitle } from "./HeroTitle";
import { HeroVideo } from "./HeroVideo";
import { OpenStatus } from "./OpenStatus";

type HeroProps = {
    content: HeroContent;
    schedule: DaySchedule[];
};

const BADGE_TEXT = "TALLER · BICIS · ACCESORIOS · SANTA FE · ";

function HeroPoster({ content }: { content: HeroContent }) {
    const common = { alt: "", sizes: "100vw", quality: 75 };
    const {
        props: { srcSet: desktop },
    } = getImageProps({ ...common, width: 1920, height: 1080, src: content.video.poster });
    const {
        props: { srcSet: mobile, ...rest },
    } = getImageProps({
        ...common,
        width: 1080,
        height: 1920,
        src: content.video.posterMobile,
        fetchPriority: "high",
        loading: "eager",
    });
    return (
        <picture>
            <source media="(min-width: 768px)" srcSet={desktop} />
            <source srcSet={mobile} />
            {/* eslint-disable-next-line jsx-a11y/alt-text -- alt vacío a propósito: imagen decorativa */}
            <img {...rest} className="absolute inset-0 size-full object-cover" />
        </picture>
    );
}

export function Hero({ content, schedule }: HeroProps) {
    const hasVideo = publicFileExists(content.video.src);

    return (
        <section
            id="inicio"
            aria-label="Inicio"
            className="relative isolate flex min-h-[100svh] flex-col justify-end overflow-hidden bg-ink text-chalk"
        >
            <div className="absolute inset-0 -z-10">
                <HeroPoster content={content} />
                {hasVideo && <HeroVideo src={content.video.src} poster={content.video.poster} />}
                <div className="absolute inset-0 bg-linear-to-t from-ink via-ink/70 to-ink/20" />
                <div className="absolute inset-0 bg-linear-to-r from-ink/90 via-ink/30 to-transparent" />
                <div aria-hidden className="speed-lines absolute inset-0 text-chalk opacity-60" />
            </div>

            {/* Badge circular girando: puro decorado, solo desktop. */}
            <div
                aria-hidden
                className="absolute right-[6%] top-[22%] hidden size-40 lg:block xl:size-48"
            >
                <svg viewBox="0 0 200 200" className="size-full animate-spin-slow">
                    <defs>
                        <path
                            id="badge-circle"
                            d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0"
                        />
                    </defs>
                    <text className="fill-chalk text-[17px] font-bold tracking-[0.32em]">
                        <textPath href="#badge-circle">{BADGE_TEXT}</textPath>
                    </text>
                </svg>
                <span className="absolute inset-0 m-auto flex size-16 items-center justify-center rounded-full bg-accent text-ink">
                    <WrenchIcon className="size-7" />
                </span>
            </div>

            <div id="contenido" className="container-x relative pb-24 pt-32 md:pb-28">
                <div className="mb-6 flex flex-wrap items-center gap-3">
                    <span className="text-xs font-bold uppercase tracking-[0.3em] text-lime">
                        {content.eyebrow}
                    </span>
                    <OpenStatus schedule={schedule} />
                </div>

                <HeroTitle lines={content.titleLines} />

                <HeroCta delay={0.75}>
                    <p className="mt-6 max-w-xl text-lg leading-relaxed text-chalk/85 md:text-xl">
                        {content.subtitle}
                    </p>
                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                        <a
                            href="#bicis"
                            className="group inline-flex items-center justify-center gap-3 rounded-full bg-accent px-7 py-4 text-base font-bold text-ink transition-transform hover:-translate-y-0.5"
                        >
                            Ver bicis
                            <ArrowRightIcon className="size-5 transition-transform group-hover:translate-x-1" />
                        </a>
                        <a
                            href="#turno"
                            className="group inline-flex items-center justify-center gap-3 rounded-full border border-chalk/30 bg-chalk/5 px-7 py-4 text-base font-bold text-chalk backdrop-blur-sm transition-colors hover:border-chalk hover:bg-chalk hover:text-ink"
                        >
                            <WrenchIcon className="size-5" />
                            Sacar turno para el taller
                        </a>
                    </div>
                </HeroCta>
            </div>

            <a
                href="#taller"
                className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-chalk/70 transition-colors hover:text-chalk md:flex"
                aria-label="Bajar a la sección del taller"
            >
                <span className="flex h-10 w-6 justify-center rounded-full border-2 border-current pt-2">
                    <span className="h-2 w-1 animate-scroll-dot rounded-full bg-current" />
                </span>
                Scroll
            </a>
        </section>
    );
}
