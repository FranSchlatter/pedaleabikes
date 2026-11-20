import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { AboutContent } from "@/types";
import { ParallaxImage } from "./ParallaxImage";

type AboutProps = {
    about: AboutContent;
};

export function About({ about }: AboutProps) {
    return (
        <section
            id="nosotros"
            aria-labelledby="nosotros-title"
            className="relative overflow-hidden bg-chalk py-24 md:py-32"
        >
            <div className="container-x grid gap-16 lg:grid-cols-2 lg:items-center lg:gap-20">
                {/* Collage asimétrico: la imagen principal rompe la grilla hacia la izquierda en desktop. */}
                <div className="relative order-2 lg:order-1">
                    <Reveal>
                        <ParallaxImage
                            image={about.images.main}
                            sizes="(min-width: 1024px) 45vw, 100vw"
                            strength={16}
                            className="aspect-[4/5] rounded-[2rem] sm:aspect-[16/11] lg:-ml-20 lg:aspect-[4/5]"
                        />
                    </Reveal>
                    <Reveal
                        delay={0.15}
                        className="absolute -bottom-10 -right-2 w-[44%] sm:-right-6 lg:-right-10"
                    >
                        <ParallaxImage
                            image={about.images.secondary}
                            sizes="(min-width: 1024px) 20vw, 45vw"
                            strength={24}
                            className="aspect-[4/5] rounded-3xl border-[6px] border-chalk shadow-2xl"
                        />
                    </Reveal>
                    <Reveal
                        delay={0.25}
                        className="absolute -top-8 right-6 hidden w-[30%] sm:block lg:right-10"
                    >
                        <ParallaxImage
                            image={about.images.tertiary}
                            sizes="(min-width: 1024px) 14vw, 30vw"
                            strength={30}
                            className="aspect-square rounded-full border-[6px] border-chalk shadow-xl"
                        />
                    </Reveal>
                    <span className="absolute -left-2 top-6 rotate-[-8deg] rounded-full bg-lime px-4 py-2 text-xs font-bold uppercase tracking-wider text-ink shadow-lg lg:-left-24">
                        Fotos placeholder
                    </span>
                </div>

                <div className="order-1 lg:order-2">
                    <SectionHeading id="nosotros-title" eyebrow="Nosotros" title={about.title} />
                    <Reveal
                        delay={0.1}
                        className="mt-6 space-y-4 text-lg leading-relaxed text-graphite"
                    >
                        {about.paragraphs.map(function (paragraph) {
                            return <p key={paragraph}>{paragraph}</p>;
                        })}
                    </Reveal>
                    <Stagger
                        as="ul"
                        className="mt-10 grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3"
                    >
                        {about.values.map(function (value, index) {
                            return (
                                <StaggerItem
                                    as="li"
                                    key={value.id}
                                    className="rounded-3xl bg-white p-5 ring-1 ring-ink/5 transition-transform duration-500 ease-out-expo hover:-translate-y-1"
                                >
                                    <span className="heading-display text-3xl text-accent-ink">
                                        0{index + 1}
                                    </span>
                                    <h3 className="mt-2 font-bold text-ink">{value.title}</h3>
                                    <p className="mt-1 text-sm leading-relaxed text-graphite">
                                        {value.description}
                                    </p>
                                </StaggerItem>
                            );
                        })}
                    </Stagger>
                </div>
            </div>
        </section>
    );
}
