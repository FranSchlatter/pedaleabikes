export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
    graphql_public: {
        Tables: {
            [_ in never]: never;
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            graphql: {
                Args: {
                    extensions?: Json;
                    operationName?: string;
                    query?: string;
                    variables?: Json;
                };
                Returns: Json;
            };
        };
        Enums: {
            [_ in never]: never;
        };
        CompositeTypes: {
            [_ in never]: never;
        };
    };
    public: {
        Tables: {
            accounts: {
                Row: {
                    active: boolean;
                    created_at: string;
                    id: string;
                    initial_balance: number;
                    kind: string;
                    name: string;
                    sort_order: number;
                };
                ComputedFields: never;
                Insert: {
                    active?: boolean;
                    created_at?: string;
                    id?: string;
                    initial_balance?: number;
                    kind?: string;
                    name: string;
                    sort_order?: number;
                };
                Update: {
                    active?: boolean;
                    created_at?: string;
                    id?: string;
                    initial_balance?: number;
                    kind?: string;
                    name?: string;
                    sort_order?: number;
                };
                Relationships: [];
            };
            bikes: {
                Row: {
                    bike_type: string | null;
                    brand: string | null;
                    color: string | null;
                    created_at: string;
                    customer_id: string;
                    id: string;
                    model: string | null;
                    notes: string | null;
                    wheel_size: string | null;
                };
                ComputedFields: never;
                Insert: {
                    bike_type?: string | null;
                    brand?: string | null;
                    color?: string | null;
                    created_at?: string;
                    customer_id: string;
                    id?: string;
                    model?: string | null;
                    notes?: string | null;
                    wheel_size?: string | null;
                };
                Update: {
                    bike_type?: string | null;
                    brand?: string | null;
                    color?: string | null;
                    created_at?: string;
                    customer_id?: string;
                    id?: string;
                    model?: string | null;
                    notes?: string | null;
                    wheel_size?: string | null;
                };
                Relationships: [
                    {
                        foreignKeyName: "bikes_customer_id_fkey";
                        columns: ["customer_id"];
                        isOneToOne: false;
                        referencedRelation: "customers";
                        referencedColumns: ["id"];
                    },
                ];
            };
            categories: {
                Row: {
                    created_at: string;
                    id: string;
                    income_category_id: string;
                    name: string;
                    sort_order: number;
                };
                ComputedFields: never;
                Insert: {
                    created_at?: string;
                    id?: string;
                    income_category_id: string;
                    name: string;
                    sort_order?: number;
                };
                Update: {
                    created_at?: string;
                    id?: string;
                    income_category_id?: string;
                    name?: string;
                    sort_order?: number;
                };
                Relationships: [
                    {
                        foreignKeyName: "categories_income_category_id_fkey";
                        columns: ["income_category_id"];
                        isOneToOne: false;
                        referencedRelation: "transaction_categories";
                        referencedColumns: ["id"];
                    },
                ];
            };
            customers: {
                Row: {
                    created_at: string;
                    email: string | null;
                    id: string;
                    name: string;
                    notes: string | null;
                    phone: string | null;
                    updated_at: string;
                };
                ComputedFields: never;
                Insert: {
                    created_at?: string;
                    email?: string | null;
                    id?: string;
                    name: string;
                    notes?: string | null;
                    phone?: string | null;
                    updated_at?: string;
                };
                Update: {
                    created_at?: string;
                    email?: string | null;
                    id?: string;
                    name?: string;
                    notes?: string | null;
                    phone?: string | null;
                    updated_at?: string;
                };
                Relationships: [];
            };
            products: {
                Row: {
                    active: boolean;
                    category_id: string | null;
                    cost: number;
                    created_at: string;
                    id: string;
                    location: string | null;
                    manual_price: number | null;
                    margin: number | null;
                    min_stock: number;
                    name: string;
                    notes: string | null;
                    price: number;
                    sku: string | null;
                    stock: number;
                    supplier_id: string | null;
                    updated_at: string;
                };
                ComputedFields: never;
                Insert: {
                    active?: boolean;
                    category_id?: string | null;
                    cost?: number;
                    created_at?: string;
                    id?: string;
                    location?: string | null;
                    manual_price?: number | null;
                    margin?: number | null;
                    min_stock?: number;
                    name: string;
                    notes?: string | null;
                    price?: number;
                    sku?: string | null;
                    stock?: number;
                    supplier_id?: string | null;
                    updated_at?: string;
                };
                Update: {
                    active?: boolean;
                    category_id?: string | null;
                    cost?: number;
                    created_at?: string;
                    id?: string;
                    location?: string | null;
                    manual_price?: number | null;
                    margin?: number | null;
                    min_stock?: number;
                    name?: string;
                    notes?: string | null;
                    price?: number;
                    sku?: string | null;
                    stock?: number;
                    supplier_id?: string | null;
                    updated_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "products_category_id_fkey";
                        columns: ["category_id"];
                        isOneToOne: false;
                        referencedRelation: "categories";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "products_supplier_id_fkey";
                        columns: ["supplier_id"];
                        isOneToOne: false;
                        referencedRelation: "suppliers";
                        referencedColumns: ["id"];
                    },
                ];
            };
            purchase_items: {
                Row: {
                    created_at: string;
                    description: string;
                    id: string;
                    previous_cost: number | null;
                    product_id: string;
                    purchase_id: string;
                    quantity: number;
                    unit_cost: number;
                };
                ComputedFields: never;
                Insert: {
                    created_at?: string;
                    description: string;
                    id?: string;
                    previous_cost?: number | null;
                    product_id: string;
                    purchase_id: string;
                    quantity: number;
                    unit_cost: number;
                };
                Update: {
                    created_at?: string;
                    description?: string;
                    id?: string;
                    previous_cost?: number | null;
                    product_id?: string;
                    purchase_id?: string;
                    quantity?: number;
                    unit_cost?: number;
                };
                Relationships: [
                    {
                        foreignKeyName: "purchase_items_product_id_fkey";
                        columns: ["product_id"];
                        isOneToOne: false;
                        referencedRelation: "products";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "purchase_items_purchase_id_fkey";
                        columns: ["purchase_id"];
                        isOneToOne: false;
                        referencedRelation: "purchases";
                        referencedColumns: ["id"];
                    },
                ];
            };
            purchases: {
                Row: {
                    account_id: string;
                    created_at: string;
                    id: string;
                    invoice_ref: string | null;
                    notes: string | null;
                    number: number;
                    occurred_at: string;
                    supplier_id: string | null;
                    total: number;
                    void_reason: string | null;
                    voided_at: string | null;
                };
                ComputedFields: never;
                Insert: {
                    account_id: string;
                    created_at?: string;
                    id?: string;
                    invoice_ref?: string | null;
                    notes?: string | null;
                    number?: never;
                    occurred_at?: string;
                    supplier_id?: string | null;
                    total?: number;
                    void_reason?: string | null;
                    voided_at?: string | null;
                };
                Update: {
                    account_id?: string;
                    created_at?: string;
                    id?: string;
                    invoice_ref?: string | null;
                    notes?: string | null;
                    number?: never;
                    occurred_at?: string;
                    supplier_id?: string | null;
                    total?: number;
                    void_reason?: string | null;
                    voided_at?: string | null;
                };
                Relationships: [
                    {
                        foreignKeyName: "purchases_account_id_fkey";
                        columns: ["account_id"];
                        isOneToOne: false;
                        referencedRelation: "accounts";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "purchases_account_id_fkey";
                        columns: ["account_id"];
                        isOneToOne: false;
                        referencedRelation: "v_account_balances";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "purchases_supplier_id_fkey";
                        columns: ["supplier_id"];
                        isOneToOne: false;
                        referencedRelation: "suppliers";
                        referencedColumns: ["id"];
                    },
                ];
            };
            sale_items: {
                Row: {
                    created_at: string;
                    description: string;
                    id: string;
                    income_category_id: string;
                    kind: string;
                    product_id: string | null;
                    quantity: number;
                    sale_id: string;
                    service_id: string | null;
                    unit_cost: number;
                    unit_price: number;
                };
                ComputedFields: never;
                Insert: {
                    created_at?: string;
                    description: string;
                    id?: string;
                    income_category_id: string;
                    kind: string;
                    product_id?: string | null;
                    quantity: number;
                    sale_id: string;
                    service_id?: string | null;
                    unit_cost?: number;
                    unit_price: number;
                };
                Update: {
                    created_at?: string;
                    description?: string;
                    id?: string;
                    income_category_id?: string;
                    kind?: string;
                    product_id?: string | null;
                    quantity?: number;
                    sale_id?: string;
                    service_id?: string | null;
                    unit_cost?: number;
                    unit_price?: number;
                };
                Relationships: [
                    {
                        foreignKeyName: "sale_items_income_category_id_fkey";
                        columns: ["income_category_id"];
                        isOneToOne: false;
                        referencedRelation: "transaction_categories";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "sale_items_product_id_fkey";
                        columns: ["product_id"];
                        isOneToOne: false;
                        referencedRelation: "products";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "sale_items_sale_id_fkey";
                        columns: ["sale_id"];
                        isOneToOne: false;
                        referencedRelation: "sales";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "sale_items_service_id_fkey";
                        columns: ["service_id"];
                        isOneToOne: false;
                        referencedRelation: "services";
                        referencedColumns: ["id"];
                    },
                ];
            };
            sales: {
                Row: {
                    account_id: string;
                    created_at: string;
                    customer_id: string | null;
                    id: string;
                    notes: string | null;
                    number: number;
                    occurred_at: string;
                    total: number;
                    void_reason: string | null;
                    voided_at: string | null;
                };
                ComputedFields: never;
                Insert: {
                    account_id: string;
                    created_at?: string;
                    customer_id?: string | null;
                    id?: string;
                    notes?: string | null;
                    number?: never;
                    occurred_at?: string;
                    total?: number;
                    void_reason?: string | null;
                    voided_at?: string | null;
                };
                Update: {
                    account_id?: string;
                    created_at?: string;
                    customer_id?: string | null;
                    id?: string;
                    notes?: string | null;
                    number?: never;
                    occurred_at?: string;
                    total?: number;
                    void_reason?: string | null;
                    voided_at?: string | null;
                };
                Relationships: [
                    {
                        foreignKeyName: "sales_account_id_fkey";
                        columns: ["account_id"];
                        isOneToOne: false;
                        referencedRelation: "accounts";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "sales_account_id_fkey";
                        columns: ["account_id"];
                        isOneToOne: false;
                        referencedRelation: "v_account_balances";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "sales_customer_id_fkey";
                        columns: ["customer_id"];
                        isOneToOne: false;
                        referencedRelation: "customers";
                        referencedColumns: ["id"];
                    },
                ];
            };
            services: {
                Row: {
                    active: boolean;
                    created_at: string;
                    description: string | null;
                    id: string;
                    name: string;
                    price: number;
                    sort_order: number;
                };
                ComputedFields: never;
                Insert: {
                    active?: boolean;
                    created_at?: string;
                    description?: string | null;
                    id?: string;
                    name: string;
                    price?: number;
                    sort_order?: number;
                };
                Update: {
                    active?: boolean;
                    created_at?: string;
                    description?: string | null;
                    id?: string;
                    name?: string;
                    price?: number;
                    sort_order?: number;
                };
                Relationships: [];
            };
            settings: {
                Row: {
                    address: string | null;
                    business_name: string;
                    default_margin: number;
                    email: string | null;
                    id: number;
                    phone: string | null;
                    price_rounding: number;
                    receipt_footer: string | null;
                    tax_id: string | null;
                    updated_at: string;
                    whatsapp: string | null;
                };
                ComputedFields: never;
                Insert: {
                    address?: string | null;
                    business_name?: string;
                    default_margin?: number;
                    email?: string | null;
                    id?: number;
                    phone?: string | null;
                    price_rounding?: number;
                    receipt_footer?: string | null;
                    tax_id?: string | null;
                    updated_at?: string;
                    whatsapp?: string | null;
                };
                Update: {
                    address?: string | null;
                    business_name?: string;
                    default_margin?: number;
                    email?: string | null;
                    id?: number;
                    phone?: string | null;
                    price_rounding?: number;
                    receipt_footer?: string | null;
                    tax_id?: string | null;
                    updated_at?: string;
                    whatsapp?: string | null;
                };
                Relationships: [];
            };
            stock_movements: {
                Row: {
                    created_at: string;
                    id: string;
                    kind: string;
                    occurred_at: string;
                    product_id: string;
                    purchase_id: string | null;
                    quantity: number;
                    reason: string | null;
                    sale_id: string | null;
                    stock_after: number;
                    work_order_id: string | null;
                };
                ComputedFields: never;
                Insert: {
                    created_at?: string;
                    id?: string;
                    kind: string;
                    occurred_at?: string;
                    product_id: string;
                    purchase_id?: string | null;
                    quantity: number;
                    reason?: string | null;
                    sale_id?: string | null;
                    stock_after: number;
                    work_order_id?: string | null;
                };
                Update: {
                    created_at?: string;
                    id?: string;
                    kind?: string;
                    occurred_at?: string;
                    product_id?: string;
                    purchase_id?: string | null;
                    quantity?: number;
                    reason?: string | null;
                    sale_id?: string | null;
                    stock_after?: number;
                    work_order_id?: string | null;
                };
                Relationships: [
                    {
                        foreignKeyName: "stock_movements_product_id_fkey";
                        columns: ["product_id"];
                        isOneToOne: false;
                        referencedRelation: "products";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "stock_movements_purchase_id_fkey";
                        columns: ["purchase_id"];
                        isOneToOne: false;
                        referencedRelation: "purchases";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "stock_movements_sale_id_fkey";
                        columns: ["sale_id"];
                        isOneToOne: false;
                        referencedRelation: "sales";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "stock_movements_work_order_id_fkey";
                        columns: ["work_order_id"];
                        isOneToOne: false;
                        referencedRelation: "work_orders";
                        referencedColumns: ["id"];
                    },
                ];
            };
            suppliers: {
                Row: {
                    active: boolean;
                    contact_name: string | null;
                    created_at: string;
                    email: string | null;
                    id: string;
                    name: string;
                    notes: string | null;
                    phone: string | null;
                    terms: string | null;
                    updated_at: string;
                };
                ComputedFields: never;
                Insert: {
                    active?: boolean;
                    contact_name?: string | null;
                    created_at?: string;
                    email?: string | null;
                    id?: string;
                    name: string;
                    notes?: string | null;
                    phone?: string | null;
                    terms?: string | null;
                    updated_at?: string;
                };
                Update: {
                    active?: boolean;
                    contact_name?: string | null;
                    created_at?: string;
                    email?: string | null;
                    id?: string;
                    name?: string;
                    notes?: string | null;
                    phone?: string | null;
                    terms?: string | null;
                    updated_at?: string;
                };
                Relationships: [];
            };
            transaction_categories: {
                Row: {
                    active: boolean;
                    code: string | null;
                    created_at: string;
                    id: string;
                    name: string;
                    report_group: string;
                    sort_order: number;
                    type: string;
                };
                ComputedFields: never;
                Insert: {
                    active?: boolean;
                    code?: string | null;
                    created_at?: string;
                    id?: string;
                    name: string;
                    report_group: string;
                    sort_order?: number;
                    type: string;
                };
                Update: {
                    active?: boolean;
                    code?: string | null;
                    created_at?: string;
                    id?: string;
                    name?: string;
                    report_group?: string;
                    sort_order?: number;
                    type?: string;
                };
                Relationships: [];
            };
            transactions: {
                Row: {
                    account_id: string;
                    amount: number;
                    category_id: string | null;
                    created_at: string;
                    customer_id: string | null;
                    description: string | null;
                    id: string;
                    occurred_at: string;
                    purchase_id: string | null;
                    sale_id: string | null;
                    supplier_id: string | null;
                    to_account_id: string | null;
                    type: string;
                    voided_at: string | null;
                    work_order_id: string | null;
                };
                ComputedFields: never;
                Insert: {
                    account_id: string;
                    amount: number;
                    category_id?: string | null;
                    created_at?: string;
                    customer_id?: string | null;
                    description?: string | null;
                    id?: string;
                    occurred_at?: string;
                    purchase_id?: string | null;
                    sale_id?: string | null;
                    supplier_id?: string | null;
                    to_account_id?: string | null;
                    type: string;
                    voided_at?: string | null;
                    work_order_id?: string | null;
                };
                Update: {
                    account_id?: string;
                    amount?: number;
                    category_id?: string | null;
                    created_at?: string;
                    customer_id?: string | null;
                    description?: string | null;
                    id?: string;
                    occurred_at?: string;
                    purchase_id?: string | null;
                    sale_id?: string | null;
                    supplier_id?: string | null;
                    to_account_id?: string | null;
                    type?: string;
                    voided_at?: string | null;
                    work_order_id?: string | null;
                };
                Relationships: [
                    {
                        foreignKeyName: "transactions_account_id_fkey";
                        columns: ["account_id"];
                        isOneToOne: false;
                        referencedRelation: "accounts";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "transactions_account_id_fkey";
                        columns: ["account_id"];
                        isOneToOne: false;
                        referencedRelation: "v_account_balances";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "transactions_category_id_fkey";
                        columns: ["category_id"];
                        isOneToOne: false;
                        referencedRelation: "transaction_categories";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "transactions_customer_id_fkey";
                        columns: ["customer_id"];
                        isOneToOne: false;
                        referencedRelation: "customers";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "transactions_purchase_id_fkey";
                        columns: ["purchase_id"];
                        isOneToOne: false;
                        referencedRelation: "purchases";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "transactions_sale_id_fkey";
                        columns: ["sale_id"];
                        isOneToOne: false;
                        referencedRelation: "sales";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "transactions_supplier_id_fkey";
                        columns: ["supplier_id"];
                        isOneToOne: false;
                        referencedRelation: "suppliers";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "transactions_to_account_id_fkey";
                        columns: ["to_account_id"];
                        isOneToOne: false;
                        referencedRelation: "accounts";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "transactions_to_account_id_fkey";
                        columns: ["to_account_id"];
                        isOneToOne: false;
                        referencedRelation: "v_account_balances";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "transactions_work_order_id_fkey";
                        columns: ["work_order_id"];
                        isOneToOne: false;
                        referencedRelation: "work_orders";
                        referencedColumns: ["id"];
                    },
                ];
            };
            work_order_items: {
                Row: {
                    created_at: string;
                    description: string;
                    id: string;
                    income_category_id: string;
                    kind: string;
                    product_id: string | null;
                    quantity: number;
                    service_id: string | null;
                    unit_cost: number;
                    unit_price: number;
                    work_order_id: string;
                };
                ComputedFields: never;
                Insert: {
                    created_at?: string;
                    description: string;
                    id?: string;
                    income_category_id: string;
                    kind: string;
                    product_id?: string | null;
                    quantity: number;
                    service_id?: string | null;
                    unit_cost?: number;
                    unit_price: number;
                    work_order_id: string;
                };
                Update: {
                    created_at?: string;
                    description?: string;
                    id?: string;
                    income_category_id?: string;
                    kind?: string;
                    product_id?: string | null;
                    quantity?: number;
                    service_id?: string | null;
                    unit_cost?: number;
                    unit_price?: number;
                    work_order_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "work_order_items_income_category_id_fkey";
                        columns: ["income_category_id"];
                        isOneToOne: false;
                        referencedRelation: "transaction_categories";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "work_order_items_product_id_fkey";
                        columns: ["product_id"];
                        isOneToOne: false;
                        referencedRelation: "products";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "work_order_items_service_id_fkey";
                        columns: ["service_id"];
                        isOneToOne: false;
                        referencedRelation: "services";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "work_order_items_work_order_id_fkey";
                        columns: ["work_order_id"];
                        isOneToOne: false;
                        referencedRelation: "work_orders";
                        referencedColumns: ["id"];
                    },
                ];
            };
            work_orders: {
                Row: {
                    account_id: string | null;
                    bike_id: string | null;
                    budget_amount: number | null;
                    created_at: string;
                    customer_id: string;
                    delivered_at: string | null;
                    diagnosis: string | null;
                    final_price: number | null;
                    id: string;
                    labor_amount: number;
                    notes: string | null;
                    number: number;
                    problem: string | null;
                    promised_at: string | null;
                    received_at: string;
                    status: string;
                    status_changed_at: string;
                    updated_at: string;
                    void_reason: string | null;
                    voided_at: string | null;
                    work_done: string | null;
                };
                ComputedFields: never;
                Insert: {
                    account_id?: string | null;
                    bike_id?: string | null;
                    budget_amount?: number | null;
                    created_at?: string;
                    customer_id: string;
                    delivered_at?: string | null;
                    diagnosis?: string | null;
                    final_price?: number | null;
                    id?: string;
                    labor_amount?: number;
                    notes?: string | null;
                    number?: never;
                    problem?: string | null;
                    promised_at?: string | null;
                    received_at?: string;
                    status?: string;
                    status_changed_at?: string;
                    updated_at?: string;
                    void_reason?: string | null;
                    voided_at?: string | null;
                    work_done?: string | null;
                };
                Update: {
                    account_id?: string | null;
                    bike_id?: string | null;
                    budget_amount?: number | null;
                    created_at?: string;
                    customer_id?: string;
                    delivered_at?: string | null;
                    diagnosis?: string | null;
                    final_price?: number | null;
                    id?: string;
                    labor_amount?: number;
                    notes?: string | null;
                    number?: never;
                    problem?: string | null;
                    promised_at?: string | null;
                    received_at?: string;
                    status?: string;
                    status_changed_at?: string;
                    updated_at?: string;
                    void_reason?: string | null;
                    voided_at?: string | null;
                    work_done?: string | null;
                };
                Relationships: [
                    {
                        foreignKeyName: "work_orders_account_id_fkey";
                        columns: ["account_id"];
                        isOneToOne: false;
                        referencedRelation: "accounts";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "work_orders_account_id_fkey";
                        columns: ["account_id"];
                        isOneToOne: false;
                        referencedRelation: "v_account_balances";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "work_orders_bike_id_fkey";
                        columns: ["bike_id"];
                        isOneToOne: false;
                        referencedRelation: "bikes";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "work_orders_customer_id_fkey";
                        columns: ["customer_id"];
                        isOneToOne: false;
                        referencedRelation: "customers";
                        referencedColumns: ["id"];
                    },
                ];
            };
        };
        Views: {
            v_account_balances: {
                Row: {
                    active: boolean;
                    expense: number | null;
                    id: string;
                    income: number | null;
                    initial_balance: number;
                    kind: string;
                    name: string;
                    sort_order: number;
                    transfer_in: number | null;
                    transfer_out: number | null;
                };
                ComputedFields: never;
                Relationships: [];
            };
            v_revenue_lines: {
                Row: {
                    description: string | null;
                    income_category_id: string | null;
                    kind: string | null;
                    occurred_at: string | null;
                    product_id: string | null;
                    quantity: number | null;
                    service_id: string | null;
                    source: string | null;
                    source_id: string | null;
                    source_number: number | null;
                    unit_cost: number | null;
                    unit_price: number | null;
                };
                ComputedFields: never;
                Relationships: [];
            };
        };
        Functions: {
            _at: { Args: { p: Json; p_key?: string }; Returns: string };
            _guess_income_category: { Args: { p_name: string }; Returns: string };
            _move_stock: {
                Args: {
                    p_at?: string;
                    p_kind: string;
                    p_product: string;
                    p_purchase?: string;
                    p_quantity: number;
                    p_reason: string;
                    p_sale?: string;
                    p_work_order?: string;
                };
                Returns: number;
            };
            _open_work_order: {
                Args: { p_id: string };
                Returns: {
                    account_id: string | null;
                    bike_id: string | null;
                    budget_amount: number | null;
                    created_at: string;
                    customer_id: string;
                    delivered_at: string | null;
                    diagnosis: string | null;
                    final_price: number | null;
                    id: string;
                    labor_amount: number;
                    notes: string | null;
                    number: number;
                    problem: string | null;
                    promised_at: string | null;
                    received_at: string;
                    status: string;
                    status_changed_at: string;
                    updated_at: string;
                    void_reason: string | null;
                    voided_at: string | null;
                    work_done: string | null;
                };
                SetofOptions: {
                    from: "*";
                    to: "work_orders";
                    isOneToOne: true;
                    isSetofReturn: false;
                };
            };
            _tx_category: { Args: { p_code: string }; Returns: string };
            add_work_order_item: { Args: { p: Json; p_work_order_id: string }; Returns: string };
            adjust_stock: {
                Args: { p_new_stock: number; p_product_id: string; p_reason: string };
                Returns: number;
            };
            ar_date: { Args: { ts: string }; Returns: string };
            bulk_update_costs: {
                Args: { p_category_id?: string; p_percent: number; p_supplier_id?: string };
                Returns: number;
            };
            cancel_work_order: { Args: { p_id: string; p_reason?: string }; Returns: undefined };
            compute_price: {
                Args: {
                    cost: number;
                    default_margin: number;
                    manual_price: number;
                    margin: number;
                    rounding: number;
                };
                Returns: number;
            };
            create_purchase: { Args: { p: Json }; Returns: Json };
            create_sale: { Args: { p: Json }; Returns: Json };
            create_work_order: { Args: { p: Json }; Returns: Json };
            deliver_work_order: {
                Args: {
                    p_account_id: string;
                    p_delivered_at?: string;
                    p_final_price?: number;
                    p_id: string;
                };
                Returns: undefined;
            };
            import_products: { Args: { p_mode?: string; p_rows: Json }; Returns: Json };
            inventory_value: {
                Args: Record<PropertyKey, never>;
                Returns: {
                    category_id: string;
                    category_name: string;
                    units: number;
                    value: number;
                }[];
            };
            remove_work_order_item: { Args: { p_item_id: string }; Returns: undefined };
            report_categories: {
                Args: { p_from: string; p_to: string };
                Returns: {
                    category_id: string;
                    code: string;
                    count: number;
                    name: string;
                    report_group: string;
                    total: number;
                    type: string;
                }[];
            };
            report_items: {
                Args: { p_from: string; p_to: string };
                Returns: {
                    cost: number;
                    description: string;
                    kind: string;
                    product_id: string;
                    quantity: number;
                    revenue: number;
                    service_id: string;
                }[];
            };
            report_monthly: {
                Args: { p_from: string; p_to: string };
                Returns: {
                    cogs: number;
                    merchandise_purchases: number;
                    month: string;
                    operating_expenses: number;
                    other_income: number;
                    revenue: number;
                    sales_count: number;
                    sales_total: number;
                    withdrawals: number;
                    work_orders_count: number;
                    work_orders_total: number;
                }[];
            };
            reset_business_data: { Args: { p_confirm: string }; Returns: undefined };
            round_price: { Args: { step: number; value: number }; Returns: number };
            set_work_order_status: { Args: { p_id: string; p_status: string }; Returns: undefined };
            void_purchase: {
                Args: { p_purchase_id: string; p_reason?: string };
                Returns: undefined;
            };
            void_sale: { Args: { p_reason?: string; p_sale_id: string }; Returns: undefined };
            work_order_total: { Args: { p_id: string }; Returns: number };
        };
        Enums: {
            [_ in never]: never;
        };
        CompositeTypes: {
            [_ in never]: never;
        };
    };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
    DefaultSchemaTableNameOrOptions extends
        | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
        | { schema: keyof DatabaseWithoutInternals },
    TableName extends (DefaultSchemaTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals;
    }
        ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
              DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
        : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
          DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
          Row: infer R;
      }
        ? R
        : never
    : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
            DefaultSchema["Views"])
      ? (DefaultSchema["Tables"] &
            DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
            Row: infer R;
        }
          ? R
          : never
      : never;

export type TablesInsert<
    DefaultSchemaTableNameOrOptions extends
        keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
    TableName extends (DefaultSchemaTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals;
    }
        ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
        : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
          Insert: infer I;
      }
        ? I
        : never
    : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
      ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
            Insert: infer I;
        }
          ? I
          : never
      : never;

export type TablesUpdate<
    DefaultSchemaTableNameOrOptions extends
        keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
    TableName extends (DefaultSchemaTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals;
    }
        ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
        : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
          Update: infer U;
      }
        ? U
        : never
    : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
      ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
            Update: infer U;
        }
          ? U
          : never
      : never;

export type Enums<
    DefaultSchemaEnumNameOrOptions extends
        keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
    EnumName extends (DefaultSchemaEnumNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals;
    }
        ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
        : never) = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
    : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
      ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
      : never;

export type CompositeTypes<
    PublicCompositeTypeNameOrOptions extends
        keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
    CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals;
    }
        ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
        : never) = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
    : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
      ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
      : never;

export const Constants = {
    graphql_public: {
        Enums: {},
    },
    public: {
        Enums: {},
    },
} as const;
