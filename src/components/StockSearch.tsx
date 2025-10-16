import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface StockSearchProps {
  onSearch: (symbol: string) => void;
  isLoading?: boolean;
}

export const StockSearch = ({ onSearch, isLoading }: StockSearchProps) => {
  const [symbol, setSymbol] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (symbol.trim()) {
      onSearch(symbol.trim().toUpperCase());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
        <Input
          type="text"
          placeholder="Search stock symbol (e.g., AAPL, MSFT, GOOGL)..."
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          className="pl-12 pr-24 h-14 text-lg glass-effect"
          disabled={isLoading}
        />
        <Button
          type="submit"
          disabled={isLoading || !symbol.trim()}
          className="absolute right-2 top-1/2 transform -translate-y-1/2"
        >
          {isLoading ? "Loading..." : "Search"}
        </Button>
      </div>
    </form>
  );
};
