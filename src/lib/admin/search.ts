export function normalize(text: string) {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "");
}

// Todas las palabras del query tienen que aparecer (en cualquier orden).
export function matches(haystack: string, query: string) {
    const h = normalize(haystack);
    return normalize(query)
        .split(/\s+/)
        .filter(Boolean)
        .every(function (word) {
            return h.includes(word);
        });
}
