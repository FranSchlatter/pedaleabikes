// Normaliza un teléfono argentino al formato de wa.me (549 + característica + número, sin 0 ni
// 15). Si no tiene característica, asume Santa Fe (342).
const DEFAULT_AREA = "342";

export function toWhatsAppNumber(phone: string | null | undefined) {
    if (!phone) return null;
    let digits = phone.replace(/\D/g, "");
    if (!digits) return null;

    if (digits.startsWith("549")) {
        digits = digits.slice(3);
    } else if (digits.startsWith("54")) {
        digits = digits.slice(2);
    }
    if (digits.startsWith("0")) {
        digits = digits.slice(1);
    }

    // Local sin característica: 15 + 7 dígitos o 7 dígitos.
    if (digits.length === 9 && digits.startsWith("15")) {
        digits = DEFAULT_AREA + digits.slice(2);
    } else if (digits.length === 7) {
        digits = DEFAULT_AREA + digits;
    }

    // Característica + 15 + número (12 dígitos): se saca el 15.
    if (digits.length === 12) {
        for (const areaLength of [2, 3, 4]) {
            if (digits.slice(areaLength, areaLength + 2) === "15") {
                digits = digits.slice(0, areaLength) + digits.slice(areaLength + 2);
                break;
            }
        }
    }

    if (digits.length !== 10) {
        return null;
    }
    return `549${digits}`;
}

export function whatsAppUrl(phone: string | null | undefined, message: string) {
    const number = toWhatsAppNumber(phone);
    const text = encodeURIComponent(message);
    return number ? `https://wa.me/${number}?text=${text}` : `https://wa.me/?text=${text}`;
}
