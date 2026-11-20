import { Stagger, StaggerItem } from "@/components/ui/Reveal";
import type { Stat } from "@/types";
import { Counter } from "./Counter";

type StatsProps = {
    stats: Stat[];
};

export function Stats({ stats }: StatsProps) {
    return (
        <section
            aria-label="Pedalea en números"
            className="relative overflow-hidden bg-ink pb-20 pt-24 text-chalk md:pb-24 md:pt-32"
        >
            <div aria-hidden className="grid-lines absolute inset-0 text-chalk" />
            <Stagger
                as="ul"
                className="container-x relative grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4"
            >
                {stats.map(function (stat, index) {
                    return (
                        <StaggerItem
                            as="li"
                            key={stat.id}
                            className="relative border-l border-white/15 pl-5 md:pl-7"
                        >
                            <span
                                aria-hidden
                                className="absolute -left-px top-0 h-10 w-0.5 bg-accent"
                            />
                            <p className="heading-display text-5xl text-chalk md:text-6xl lg:text-7xl">
                                <Counter
                                    value={stat.value}
                                    prefix={stat.prefix}
                                    suffix={stat.suffix}
                                />
                            </p>
                            <p className="mt-3 max-w-[14rem] text-sm font-medium uppercase tracking-wider text-steel md:text-base">
                                {stat.label}
                            </p>
                            <span
                                aria-hidden
                                className="absolute right-0 top-0 hidden text-xs font-bold text-graphite md:block"
                            >
                                0{index + 1}
                            </span>
                        </StaggerItem>
                    );
                })}
            </Stagger>
        </section>
    );
}
