import { useState } from "react";
import { StockSearch } from "@/components/StockSearch";
import { StockCard } from "@/components/StockCard";
import { StockChart } from "@/components/StockChart";
import { TrendingUp, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { fetchStockQuote, fetchHistoricalData, StockData, HistoricalData } from "@/lib/stockApi";

const Index = () => {
  const [stockData1, setStockData1] = useState<StockData | null>(null);
  const [historicalData1, setHistoricalData1] = useState<HistoricalData[]>([]);
  const [isLoading1, setIsLoading1] = useState(false);

  const [stockData2, setStockData2] = useState<StockData | null>(null);
  const [historicalData2, setHistoricalData2] = useState<HistoricalData[]>([]);
  const [isLoading2, setIsLoading2] = useState(false);

  const handleSearch1 = async (symbol: string) => {
    setIsLoading1(true);
    try {
      const [quote, historical] = await Promise.all([
        fetchStockQuote(symbol),
        fetchHistoricalData(symbol),
      ]);

      setStockData1(quote);
      setHistoricalData1(historical);
      toast.success(`Loaded data for ${symbol}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to fetch stock data");
      setStockData1(null);
      setHistoricalData1([]);
    } finally {
      setIsLoading1(false);
    }
  };

  const handleSearch2 = async (symbol: string) => {
    setIsLoading2(true);
    try {
      const [quote, historical] = await Promise.all([
        fetchStockQuote(symbol),
        fetchHistoricalData(symbol),
      ]);

      setStockData2(quote);
      setHistoricalData2(historical);
      toast.success(`Loaded data for ${symbol}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to fetch stock data");
      setStockData2(null);
      setHistoricalData2([]);
    } finally {
      setIsLoading2(false);
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
                Compare Stocks Side by Side
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Search any two US stock symbols to compare their performance
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Stock 1</h3>
                <StockSearch onSearch={handleSearch1} isLoading={isLoading1} />
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Stock 2</h3>
                <StockSearch onSearch={handleSearch2} isLoading={isLoading2} />
              </div>
            </div>
          </section>

          {/* Results Section */}
          {(stockData1 || stockData2) && (
            <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  {stockData1 && (
                    <>
                      <StockCard
                        symbol={stockData1.symbol}
                        price={stockData1.price}
                        change={stockData1.change}
                        changePercent={stockData1.changePercent}
                        high={stockData1.high}
                        low={stockData1.low}
                        open={stockData1.open}
                        volume={stockData1.volume}
                      />
                      {historicalData1.length > 0 && (
                        <StockChart data={historicalData1} symbol={stockData1.symbol} />
                      )}
                    </>
                  )}
                </div>
                <div className="space-y-6">
                  {stockData2 && (
                    <>
                      <StockCard
                        symbol={stockData2.symbol}
                        price={stockData2.price}
                        change={stockData2.change}
                        changePercent={stockData2.changePercent}
                        high={stockData2.high}
                        low={stockData2.low}
                        open={stockData2.open}
                        volume={stockData2.volume}
                      />
                      {historicalData2.length > 0 && (
                        <StockChart data={historicalData2} symbol={stockData2.symbol} />
                      )}
                    </>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Empty State */}
          {!stockData1 && !stockData2 && !isLoading1 && !isLoading2 && (
            <section className="text-center py-16 space-y-6">
              <div className="inline-block p-4 rounded-full bg-primary/10">
                <BarChart3 className="h-16 w-16 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-semibold">Start Your Comparison</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Enter stock symbols above to compare their performance side by side
                </p>
              </div>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Popular stocks:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "NVDA", "META", "NFLX"].map((symbol) => (
                    <button
                      key={symbol}
                      onClick={() => !stockData1 ? handleSearch1(symbol) : handleSearch2(symbol)}
                      className="px-4 py-2 rounded-lg glass-effect hover:bg-primary/10 transition-colors"
                    >
                      {symbol}
                    </button>
                  ))}
                </div>
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
