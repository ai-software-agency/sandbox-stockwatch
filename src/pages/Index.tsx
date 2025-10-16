import { useState } from "react";
import { StockSearch } from "@/components/StockSearch";
import { StockCard } from "@/components/StockCard";
import { StockChart } from "@/components/StockChart";
import { TrendingUp, BarChart3, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { fetchStockQuote, fetchHistoricalData, StockData, HistoricalData } from "@/lib/stockApi";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Index = () => {
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (symbol: string) => {
    setIsLoading(true);
    try {
      const [quote, historical] = await Promise.all([
        fetchStockQuote(symbol),
        fetchHistoricalData(symbol),
      ]);

      setStockData(quote);
      setHistoricalData(historical);
      toast.success(`Loaded data for ${symbol}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to fetch stock data");
      setStockData(null);
      setHistoricalData([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 glass-effect sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">StockWatch</h1>
              <p className="text-sm text-muted-foreground">Real-time US Stock Market Data</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Search Section */}
          <section className="text-center space-y-6">
            <div className="space-y-3">
              <h2 className="text-4xl md:text-5xl font-bold">
                Track Your Investments
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Search any US stock symbol to view live prices, historical charts, and key metrics
              </p>
            </div>
            <StockSearch onSearch={handleSearch} isLoading={isLoading} />
          </section>

          {/* API Notice */}
          <Alert className="max-w-2xl mx-auto border-primary/50 bg-primary/5">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Using demo API key with rate limits. Get your free API key at{" "}
              <a
                href="https://www.alphavantage.co/support/#api-key"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                Alpha Vantage
              </a>{" "}
              to update in <code className="text-xs bg-muted px-1 py-0.5 rounded">src/lib/stockApi.ts</code>
            </AlertDescription>
          </Alert>

          {/* Results Section */}
          {stockData && (
            <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <StockCard
                symbol={stockData.symbol}
                price={stockData.price}
                change={stockData.change}
                changePercent={stockData.changePercent}
                high={stockData.high}
                low={stockData.low}
                open={stockData.open}
                volume={stockData.volume}
              />

              {historicalData.length > 0 && (
                <StockChart data={historicalData} symbol={stockData.symbol} />
              )}
            </section>
          )}

          {/* Empty State */}
          {!stockData && !isLoading && (
            <section className="text-center py-16 space-y-6">
              <div className="inline-block p-4 rounded-full bg-primary/10">
                <BarChart3 className="h-16 w-16 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-semibold">Start Your Analysis</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Enter a stock symbol above to view detailed analytics and historical performance
                </p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA"].map((symbol) => (
                  <button
                    key={symbol}
                    onClick={() => handleSearch(symbol)}
                    className="px-4 py-2 rounded-lg glass-effect hover:bg-primary/10 transition-colors"
                  >
                    {symbol}
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-16">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>Data provided by Alpha Vantage • Not financial advice</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
