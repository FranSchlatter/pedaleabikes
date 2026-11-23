import type { Metadata } from "next";
import {
    AccountsEditor,
    BusinessForm,
    CategoriesEditor,
    DataPanel,
    PricingForm,
    ServicesEditor,
    TxCategoriesEditor,
} from "@/components/admin/settings/SettingsPanels";
import { PageHeader } from "@/components/admin/ui/misc";
import { getDb, getUserEmail } from "@/lib/admin/auth";
import { getSettings } from "@/lib/admin/queries";

export const metadata: Metadata = { title: "Configuración" };

export default async function SettingsPage() {
    const db = await getDb();
    const [settings, email, { data: accounts }, { data: categories }, { data: txCategories }, { data: services }] =
        await Promise.all([
            getSettings(db),
            getUserEmail(),
            db.from("accounts").select("id, name, kind, initial_balance, active, sort_order").order("sort_order"),
            db.from("categories").select("id, name, income_category_id").order("sort_order").order("name"),
            db.from("transaction_categories").select("id, name, type, report_group, active, code").order("type").order("sort_order"),
            db.from("services").select("id, name, description, price, active, sort_order").order("sort_order"),
        ]);

    const incomeOptions = (txCategories ?? [])
        .filter(function (c) {
            return c.type === "income";
        })
        .map(function (c) {
            return { value: c.id, label: c.name };
        });

    return (
        <div className="max-w-5xl space-y-4">
            <PageHeader title="Configuración" description={email ? `Sesión: ${email}` : undefined} />
            <PricingForm settings={settings} />
            <BusinessForm settings={settings} />
            <AccountsEditor
                rows={(accounts ?? []).map(function (a) {
                    return { ...a, initial_balance: Number(a.initial_balance) };
                })}
            />
            <ServicesEditor
                rows={(services ?? []).map(function (s) {
                    return { ...s, price: Number(s.price) };
                })}
            />
            <CategoriesEditor rows={categories ?? []} incomeCategories={incomeOptions} />
            <TxCategoriesEditor rows={txCategories ?? []} />
            <DataPanel />
        </div>
    );
}
