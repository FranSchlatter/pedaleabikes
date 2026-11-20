import { ArrowUpRightIcon, InstagramIcon } from "@/components/ui/Icons";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { publicFileExists } from "@/lib/media";
import type { BusinessInfo, VideoItem } from "@/types";
import { LazyVideo } from "./LazyVideo";

type VideosProps = {
    videos: VideoItem[];
    business: BusinessInfo;
};

export function Videos({ videos, business }: VideosProps) {
    return (
        <section
            id="videos"
            aria-labelledby="videos-title"
            className="relative overflow-hidden bg-ink-2 py-24 text-chalk md:py-32"
        >
            <div className="container-x">
                <SectionHeading
                    id="videos-title"
                    eyebrow="Detrás del taller"
                    tone="dark"
                    title={
                        <>
                            Mirá cómo <span className="text-accent">laburamos</span>
                        </>
                    }
                />

                {/* Mobile: carrusel con scroll-snap; desktop: grilla escalonada. */}
                <Stagger
                    as="ul"
                    className="-mx-5 mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0"
                >
                    {videos.map(function (video, index) {
                        return (
                            <StaggerItem
                                as="li"
                                key={video.id}
                                className={`relative aspect-[9/16] w-[78%] md:aspect-[3/4] shrink-0 snap-center overflow-hidden rounded-3xl ring-1 ring-white/10 md:w-auto ${
                                    index === 1 ? "md:translate-y-12" : ""
                                }`}
                            >
                                <LazyVideo video={video} available={publicFileExists(video.src)} />
                            </StaggerItem>
                        );
                    })}
                </Stagger>

                <Reveal className="mt-16 md:mt-28">
                    <a
                        href={business.instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative flex flex-col gap-6 overflow-hidden rounded-[2rem] bg-[linear-gradient(120deg,#ff5b1f,#e1306c_55%,#833ab4)] p-8 md:flex-row md:items-center md:justify-between md:p-12"
                    >
                        <div
                            aria-hidden
                            className="speed-lines absolute inset-0 text-chalk opacity-40"
                        />
                        <div className="relative flex items-center gap-5">
                            <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-chalk text-ink transition-transform duration-500 ease-out-expo group-hover:-rotate-6 group-hover:scale-110">
                                <InstagramIcon className="size-8" />
                            </span>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.3em] text-chalk/90">
                                    Seguinos en Instagram
                                </p>
                                <p className="heading-display mt-1 text-3xl break-all text-chalk sm:text-4xl md:text-6xl">
                                    {business.instagramHandle}
                                </p>
                            </div>
                        </div>
                        <span className="relative inline-flex items-center gap-2 self-start rounded-full bg-ink px-6 py-3.5 font-bold text-chalk md:self-auto">
                            Ver perfil
                            <ArrowUpRightIcon className="size-5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                        </span>
                    </a>
                </Reveal>
            </div>
        </section>
    );
}
