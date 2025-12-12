import { statementApi } from "@/api/statement.api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Statement } from "@/types/statement"
import { useEffect, useState } from "react"


export default function StatementDashboard() {
  const [statements, setStatements] = useState<Statement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatements = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await statementApi.getStatements();
        if (res.data) setStatements(res.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Неизвестная ошибка");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatements();
  }, []);

  if (isLoading) return <div className="p-6">Загрузка...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="min-h-screen p-6 bg-background">
      <h1 className="text-2xl font-bold mb-6">Дашборд заявлений</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statements.map((statement) => (
          <Card key={statement.id} className="shadow-md">
            <CardHeader>
              <CardTitle>
                {statement.senderFullname} → {statement.receiverFullname}
              </CardTitle>
              <CardDescription>
                {statement.amount} {statement.currency} — {statement.status.toUpperCase()}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-end">
              {statement.status === "pending" && (
                <Button size="sm" variant="outline">
                  Подтвердить
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
