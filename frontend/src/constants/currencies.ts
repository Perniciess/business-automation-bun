import type { Currency } from "@/types/statement";

export const CURRENCIES: readonly Currency[] = [
    "USD",
    "EUR",
    "GBP",
    "RUB",
    "JPY",
    "CNY",
    "CHF",
    "CAD",
    "AUD",
] as const;
