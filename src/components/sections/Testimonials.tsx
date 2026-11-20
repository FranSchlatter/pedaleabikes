import { StarIcon } from "@/components/ui/Icons";
import { Stagger, StaggerItem } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Testimonial } from "@/types";

type TestimonialsProps = {
    testimonials: Testimonial[];
};

const ROTATIONS = ["md:-rotate-2", "md:rotate-1 md:translate-y-8", "md:-rotate-1"];

export function Testimonials({ testimonials }: TestimonialsProps) {
    return (
        <section
            aria-labelledby="testimonios-title"
            className="relative overflow-hidden bg-accent py-24 text-ink md:py-32"
        >
            <div aria-hidden className="speed-lines absolute inset-0 text-ink opacity-50" />
            <span
                aria-hidden
                className="heading-display pointer-events-none absolute -left-4 top-0 select-none text-[18rem] leading-[0.8] text-ink/10 md:text-[28rem]"
            >
                “
            </span>
            <div className="container-x relative">
                <SectionHeading
                    id="testimonios-title"
                    eyebrow="Testimonios"
                    tone="accent"
                    title="Lo que dicen los que ruedan"
                />
                <Stagger as="ul" className="mt-14 grid gap-6 md:grid-cols-3 md:gap-8">
                    {testimonials.map(function (testimonial, index) {
                        return (
                            <StaggerItem as="li" key={testimonial.id}>
                                <figure
                                    className={`flex h-full flex-col rounded-3xl bg-ink p-7 text-chalk shadow-[0_30px_60px_-30px_rgba(14,15,17,0.7)] transition-transform duration-500 ease-out-expo hover:rotate-0 md:p-8 ${ROTATIONS[index % ROTATIONS.length]}`}
                                >
                                    <div
                                        className="flex gap-1 text-mint"
                                        aria-label={`${testimonial.rating} de 5 estrellas`}
                                        role="img"
                                    >
                                        {Array.from({ length: testimonial.rating }).map(
                                            function (_, starIndex) {
                                                return (
                                                    <StarIcon key={starIndex} className="size-5" />
                                                );
                                            },
                                        )}
                                    </div>
                                    <blockquote className="mt-5 flex-1 text-lg leading-relaxed">
                                        “{testimonial.quote}”
                                    </blockquote>
                                    <figcaption className="mt-6 flex items-center gap-3 border-t border-white/10 pt-5">
                                        <span className="heading-display flex size-11 items-center justify-center rounded-full bg-accent text-xl text-ink">
                                            {testimonial.name.charAt(0)}
                                        </span>
                                        <span>
                                            <span className="block font-bold">
                                                {testimonial.name}
                                            </span>
                                            <span className="block text-sm text-steel">
                                                {testimonial.context}
                                            </span>
                                        </span>
                                    </figcaption>
                                </figure>
                            </StaggerItem>
                        );
                    })}
                </Stagger>
            </div>
        </section>
    );
}
