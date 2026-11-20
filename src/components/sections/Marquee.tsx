import { WheelIcon } from "@/components/ui/Icons";

type MarqueeProps = {
    items: string[];
};

function MarqueeRow({ items, reverse }: { items: string[]; reverse?: boolean }) {
    // Se duplica la lista para que el loop (-50%) sea continuo; la copia queda oculta a lectores.
    const groups = [false, true];
    return (
        <div className="flex w-max">
            <div
                className={`flex shrink-0 ${reverse ? "animate-marquee-reverse" : "animate-marquee"}`}
            >
                {groups.map(function (isCopy) {
                    return (
                        <ul
                            key={String(isCopy)}
                            aria-hidden={isCopy}
                            className="flex shrink-0 items-center"
                        >
                            {items.map(function (item) {
                                return (
                                    <li key={item} className="flex items-center">
                                        <span className="heading-display px-6 text-3xl md:text-5xl">
                                            {item}
                                        </span>
                                        <WheelIcon className="size-7 shrink-0 md:size-9" />
                                    </li>
                                );
                            })}
                        </ul>
                    );
                })}
            </div>
        </div>
    );
}

export function Marquee({ items }: MarqueeProps) {
    return (
        <section aria-label="Lo que hacemos" className="relative z-10 -my-6 overflow-hidden py-6">
            <div className="-rotate-2 scale-105 bg-accent py-4 text-ink shadow-[0_20px_40px_-20px_rgba(0,0,0,0.5)] md:py-5">
                <MarqueeRow items={items} />
            </div>
            <div className="-mt-2 rotate-1 scale-105 bg-ink py-3 text-chalk md:py-4">
                <div className="opacity-90 [&_.heading-display]:text-xl md:[&_.heading-display]:text-3xl [&_svg]:size-5 [&_svg]:text-mint">
                    <MarqueeRow items={items} reverse />
                </div>
            </div>
        </section>
    );
}
