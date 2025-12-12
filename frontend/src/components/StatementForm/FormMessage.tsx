import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, XCircle } from "lucide-react";
import { useEffect } from "react";

interface FormMessageProps {
    message: string;
    type: "success" | "error";
    onDismiss: () => void;
}

export function FormMessage({ message, type, onDismiss }: FormMessageProps) {
    useEffect(() => {
        const timer = setTimeout(onDismiss, 5000);
        return () => clearTimeout(timer);
    }, [message, onDismiss]);

    const isSuccess = type === "success";
    const Icon = isSuccess ? CheckCircle2 : XCircle;

    return (
        <Alert
            className={
                isSuccess
                    ? "border-green-500 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100"
                    : "border-red-500 bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-100"
            }
        >
            <Icon className="h-4 w-4" />
            <AlertDescription>{message}</AlertDescription>
        </Alert>
    );
}
