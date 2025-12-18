import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { CURRENCIES } from "@/constants/currencies"

interface CurrencySelectProps {
    value: string;
    onValueChange: (value: string) => void;
}

export function CurrencySelect({ value, onValueChange }: CurrencySelectProps) {
    return (
        <div className="space-y-2">
            <Label>Валюта</Label>
            <Select value={value} onValueChange={onValueChange}>
                <SelectTrigger>
                    <SelectValue placeholder="Выберите..." />
                </SelectTrigger>
                <SelectContent>
                    {CURRENCIES.map((currency) => (
                        <SelectItem key={currency} value={currency}>
                            {currency}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
