import { formatARS } from "./money";

type MessageItem = { description: string; quantity: number; unit_price: number };

type MessageOrder = {
    number: number;
    customerName: string;
    bike: string;
    labor: number;
    items: MessageItem[];
    total: number;
};

function firstName(name: string) {
    return name.trim().split(/\s+/)[0] ?? name;
}

export function budgetMessage(order: MessageOrder, businessName: string) {
    const lines = order.items.map(function (i) {
        const qty = i.quantity > 1 ? `${i.quantity}× ` : "";
        return `• ${qty}${i.description}: ${formatARS(i.quantity * i.unit_price)}`;
    });
    if (order.labor > 0) {
        lines.push(`• Mano de obra: ${formatARS(order.labor)}`);
    }
    return [
        `¡Hola ${firstName(order.customerName)}! Te escribimos de ${businessName} por tu ${order.bike} (orden #${order.number}).`,
        "",
        "Este es el presupuesto:",
        ...lines,
        "",
        `*Total: ${formatARS(order.total)}*`,
        "",
        "¿Te parece bien que avancemos? Nada se toca sin tu OK.",
    ].join("\n");
}

export function readyMessage(order: MessageOrder, businessName: string, address: string) {
    return [
        `¡Hola ${firstName(order.customerName)}! Tu ${order.bike} ya está lista para retirar en ${businessName}${address ? ` (${address})` : ""}.`,
        `Total: ${formatARS(order.total)} (orden #${order.number}).`,
        "¡Te esperamos!",
    ].join("\n");
}
