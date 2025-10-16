import { TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StockCardProps {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  volume: number;
}

export const StockCard = ({
  symbol,
  price,
  change,
  changePercent,
  high,
  low,
  open,
  volume,
}: StockCardProps) => {
  const isPositive = change >= 0;

  return (
    <Card className="gradient-card border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-3xl font-bold">{symbol}</span>
          <div className={`flex items-center gap-2 ${isPositive ? "text-success" : "text-destructive"}`}>
            {isPositive ? <TrendingUp className="h-6 w-6" /> : <TrendingDown className="h-6 w-6" />}
            <span className="text-2xl font-bold">
              {isPositive ? "+" : ""}
              {changePercent.toFixed(2)}%
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="text-5xl font-bold tabular-nums">${price.toFixed(2)}</div>
          <div className={`text-xl mt-1 ${isPositive ? "text-success" : "text-destructive"}`}>
            {isPositive ? "+" : ""}${change.toFixed(2)}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border/50">
          <div>
            <div className="text-sm text-muted-foreground">Open</div>
            <div className="text-lg font-semibold tabular-nums">${open.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">High</div>
            <div className="text-lg font-semibold tabular-nums text-success">${high.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Low</div>
            <div className="text-lg font-semibold tabular-nums text-destructive">${low.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Volume</div>
            <div className="text-lg font-semibold tabular-nums">{volume.toLocaleString()}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
