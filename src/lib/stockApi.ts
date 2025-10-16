// Stock API Integration
// For demo purposes, this uses Alpha Vantage API
// Users will need to get a free API key from: https://www.alphavantage.co/support/#api-key

const API_KEY = "demo"; // Replace with your API key

export interface StockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  volume: number;
}

export interface HistoricalData {
  date: string;
  close: number;
  volume: number;
}

export const fetchStockQuote = async (symbol: string): Promise<StockData> => {
  try {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`
    );
    const data = await response.json();

    if (data["Error Message"]) {
      throw new Error("Invalid stock symbol");
    }

    if (data.Note) {
      throw new Error("API rate limit reached. Please try again in a minute.");
    }

    const quote = data["Global Quote"];

    if (!quote || Object.keys(quote).length === 0) {
      throw new Error("No data found for this symbol");
    }

    return {
      symbol: quote["01. symbol"],
      price: parseFloat(quote["05. price"]),
      change: parseFloat(quote["09. change"]),
      changePercent: parseFloat(quote["10. change percent"].replace("%", "")),
      high: parseFloat(quote["03. high"]),
      low: parseFloat(quote["04. low"]),
      open: parseFloat(quote["02. open"]),
      volume: parseInt(quote["06. volume"]),
    };
  } catch (error) {
    console.error("Error fetching stock quote:", error);
    throw error;
  }
};

export const fetchHistoricalData = async (symbol: string): Promise<HistoricalData[]> => {
  try {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${API_KEY}`
    );
    const data = await response.json();

    if (data["Error Message"]) {
      throw new Error("Invalid stock symbol");
    }

    if (data.Note) {
      throw new Error("API rate limit reached");
    }

    const timeSeries = data["Time Series (Daily)"];

    if (!timeSeries) {
      throw new Error("No historical data available");
    }

    // Get last 30 days
    const dates = Object.keys(timeSeries).slice(0, 30).reverse();

    return dates.map((date) => ({
      date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      close: parseFloat(timeSeries[date]["4. close"]),
      volume: parseInt(timeSeries[date]["5. volume"]),
    }));
  } catch (error) {
    console.error("Error fetching historical data:", error);
    throw error;
  }
};
