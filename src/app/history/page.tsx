"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { DataTable } from "./table/data-table";
import { stockIn, columns } from "./table/columns";
import { DatePickerWithRange } from "./dateRange";
import { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { addDays } from "date-fns"; 
import { Loader2, Search } from "lucide-react";
import toast from "react-hot-toast";

export default function HistoryPage() {
  // Set initial date range to the current date
  const today = new Date();
  const firstDate = new Date(today.getFullYear(), today.getMonth(), 1);
  
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: firstDate,
    to: addDays(today, 1),
  });
  
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Function to fetch data based on selected date range
  const getStockInData = async () => {
    if (!dateRange?.from || !dateRange?.to) {
      alert("Please select a date range");
      return;
    }

    setLoading(true);
    try {
      // Convert date to 'YYYY-MM-DD' format
      const params = { 
        from: dateRange.from.toISOString(),
        to: dateRange.to.toISOString(),
      };

      // API call to get stock data
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/api/history`, { params });
      setData(res.data.items);
    } catch (error) {
      toast.error("Error fetching data");
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when the component mounts
  useEffect(() => {
    getStockInData();
  }, []); // Empty dependency array to run once on mount

  return (
    <div>
      <h1 className="text-3xl font-semibold capitalize">History</h1>
      <div className="flex flex-center gap-2 m-3">
        <DatePickerWithRange date={dateRange} setDate={setDateRange} />
        <Button className="text-white" onClick={getStockInData}>
          {loading ? <Loader2 className="animate-spin" /> : <Search />}
        </Button>
      </div>

      <div className="mt-3 justify-between">
        {loading ? (
          <Loader2 className="col-span-3 h-10 w-10 text-blue-600 animate-spin mx-auto" />
        ) : (
          <DataTable from={dateRange?.from} to={dateRange?.to} columns={columns} data={data} />
        )}
      </div>
    </div>
  );
}
