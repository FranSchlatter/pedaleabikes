"use client";

import { SearchIcon } from "lucide-react";
import { useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/admin/cn";
import { matches } from "@/lib/admin/search";
import { fieldClass } from "./input";

export type SearchOption = {
    key: string;
    label: string;
    // Texto extra para buscar (SKU, teléfono, ...).
    keywords?: string;
    sublabel?: ReactNode;
    right?: ReactNode;
    group?: string;
};

type Props = {
    options: SearchOption[];
    onSelect: (option: SearchOption) => void;
    placeholder?: string;
    autoFocus?: boolean;
    limit?: number;
    // Enter con el buscador vacío (p. ej. confirmar la venta).
    onEmptyEnter?: () => void;
    inputRef?: React.RefObject<HTMLInputElement | null>;
    className?: string;
    emptyText?: string;
    id?: string;
};

// Autocompletado con teclado: ↑ ↓ para moverse, Enter elige, Esc limpia.
export function SearchSelect({
    options,
    onSelect,
    placeholder = "Buscar…",
    autoFocus,
    limit = 8,
    onEmptyEnter,
    inputRef,
    className,
    emptyText = "Sin resultados",
    id,
}: Props) {
    const [query, setQuery] = useState("");
    const [active, setActive] = useState(0);
    const [focused, setFocused] = useState(false);
    const listId = useId();
    const localRef = useRef<HTMLInputElement>(null);
    const ref = inputRef ?? localRef;

    const results = useMemo(
        function () {
            if (!query.trim()) return [];
            return options
                .filter(function (o) {
                    return matches(`${o.label} ${o.keywords ?? ""}`, query);
                })
                .slice(0, limit);
        },
        [options, query, limit],
    );

    function choose(option: SearchOption) {
        onSelect(option);
        setQuery("");
        setActive(0);
        ref.current?.focus();
    }

    function handleKey(e: KeyboardEvent<HTMLInputElement>) {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive(function (a) {
                return Math.min(a + 1, results.length - 1);
            });
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive(function (a) {
                return Math.max(a - 1, 0);
            });
        } else if (e.key === "Enter") {
            if (results[active]) {
                e.preventDefault();
                choose(results[active]);
            } else if (!query.trim() && onEmptyEnter) {
                e.preventDefault();
                onEmptyEnter();
            }
        } else if (e.key === "Escape" && query) {
            e.preventDefault();
            e.stopPropagation();
            setQuery("");
        }
    }

    const showList = focused && query.trim().length > 0;

    return (
        <div className={cn("relative", className)}>
            <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <input
                id={id}
                ref={ref}
                type="text"
                role="combobox"
                aria-expanded={showList}
                aria-controls={listId}
                aria-autocomplete="list"
                autoComplete="off"
                autoFocus={autoFocus}
                value={query}
                placeholder={placeholder}
                onChange={function (e) {
                    setQuery(e.target.value);
                    setActive(0);
                }}
                onFocus={function () {
                    setFocused(true);
                }}
                onBlur={function () {
                    // Deja terminar el click en una opción.
                    setTimeout(function () {
                        setFocused(false);
                    }, 150);
                }}
                onKeyDown={handleKey}
                className={cn(fieldClass, "h-10 pl-8 text-base")}
            />
            {showList ? (
                <ul
                    id={listId}
                    role="listbox"
                    className="absolute inset-x-0 top-full z-20 mt-1 max-h-80 overflow-y-auto rounded-md border border-line-strong bg-surface py-1 shadow-lg"
                >
                    {results.length === 0 ? (
                        <li className="px-3 py-2 text-sm text-muted">{emptyText}</li>
                    ) : (
                        results.map(function (option, index) {
                            return (
                                <li
                                    key={option.key}
                                    role="option"
                                    aria-selected={index === active}
                                    onMouseDown={function (e) {
                                        e.preventDefault();
                                        choose(option);
                                    }}
                                    onMouseEnter={function () {
                                        setActive(index);
                                    }}
                                    className={cn(
                                        "flex cursor-pointer items-center justify-between gap-3 px-3 py-1.5 text-sm",
                                        index === active && "bg-info-soft",
                                    )}
                                >
                                    <span className="min-w-0">
                                        <span className="block truncate font-medium">
                                            {option.label}
                                        </span>
                                        {option.sublabel ? (
                                            <span className="block truncate text-xs text-muted">
                                                {option.sublabel}
                                            </span>
                                        ) : null}
                                    </span>
                                    {option.right ? (
                                        <span className="shrink-0 text-right tabular-nums">
                                            {option.right}
                                        </span>
                                    ) : null}
                                </li>
                            );
                        })
                    )}
                </ul>
            ) : null}
        </div>
    );
}
