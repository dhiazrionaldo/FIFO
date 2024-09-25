"use client";

import Image from "next/image"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import toast from "react-hot-toast";
import axios from "axios";
import { addDays } from "date-fns"; 
import { DateRange } from "react-day-picker";
import { useEffect, useState } from "react";
import exp from "constants";
import { DatePickerWithRange } from "./dateRange";
import { Boxes, Loader2, Martini, PackageOpen, Search, Warehouse } from "lucide-react";
import { Overview } from "./cost-overview";



export default function HomePage(){ const today = new Date();
    const firstDate = new Date(today.getFullYear(), today.getMonth(), 1);
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
      from: firstDate,
      to: addDays(today, 1),
    });
    const [loading, setLoading] = useState(false);
    const [expenseStorage, setExpenseStorage] = useState('');
    const [expenseLounge, setExpenseLounge] = useState('');
    const [stockLounge, setStockLounge] = useState(0);
    const [stockStorage, setStockStorage] = useState(0);

    const GetTotalExpense = async () => {
        if (!dateRange?.from || !dateRange?.to) {
            alert("Please select a date range");
            return;
        }
    
        setLoading(true);
        try {
            const params = {
                from: dateRange?.from?.toISOString(),
                to: dateRange?.to?.toISOString(),
            };
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/api/dashboard/getTotalExpense`, { params });
    
            console.log(res.data.items);
    
            // Loop through the response array to set values based on the source field
            res.data.items.forEach((item: { source: string; total_price: number }) => {
                const { source, total_price } = item;
    
                const formattedCurrency = new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                }).format(total_price);
    
                if (source === 'STORAGE') {
                    setExpenseStorage(formattedCurrency);
                } else if (source === 'LOUNGE') {
                    setExpenseLounge(formattedCurrency);
                }
            });
    
            setLoading(false);
        } catch (error) {
            console.error("Error fetching data:", error);
            setLoading(false);
        }
    };  
    
    const GetTotalStock = async () => {
        if (!dateRange?.from || !dateRange?.to) {
            alert("Please select a date range");
            return;
        }
    
        setLoading(true);
        try {
            const params = {
                from: dateRange?.from?.toISOString(),
                to: dateRange?.to?.toISOString(),
            };
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/api/dashboard/getTotalStocks`, { params });
    
            console.log(res.data.items);
    
            // Loop through the response array to set values based on the source field
            res.data.items.forEach((item: { source: string; total_qty: number }) => {
                const { source, total_qty } = item;
    
                if (source === 'STORAGE') {
                    setStockStorage(total_qty);
                } else if (source === 'LOUNGE') {
                    setStockLounge(total_qty);
                }
            });
    
            setLoading(false);
        } catch (error) {
            console.error("Error fetching data:", error);
            setLoading(false);
        }
    }; 

    useEffect(() => {
        GetTotalExpense();
        GetTotalStock();
    }, []);

    return(
        <div>
            <h1 className="text-3xl font-semibold capitalize">Dashboard</h1>
            <div className="mt-3 justify-between">
            <div className="hidden flex-col md:flex">
                <Tabs defaultValue="overview" className="space-y-4">
                    <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="analytics" disabled>
                        Analytics
                    </TabsTrigger>
                    <TabsTrigger value="reports" disabled>
                        Reports
                    </TabsTrigger>
                    <TabsTrigger value="notifications" disabled>
                        Notifications
                    </TabsTrigger>
                    </TabsList>
                    <div className="flex flex-col md:flex-row flex-center gap-2 m-3">
                        <DatePickerWithRange date={dateRange} setDate={setDateRange} />
                        <Button className="text-white" onClick={GetTotalExpense}>
                            {loading ? <Loader2 className="animate-spin" /> : <Search />}
                        </Button>
                    </div>
                    <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                            Storage Expense
                            </CardTitle>
                            <Warehouse className="w-5 h-5"/>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{expenseStorage}</div>
                        </CardContent>
                        </Card>
                        <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                            Lounge Expense
                            </CardTitle>
                            <Martini className="w-5 h-5"/>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{expenseLounge}</div>
                        </CardContent>
                        </Card>
                        <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Storage Qty</CardTitle>
                            <Boxes className="w-5 h-5" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stockStorage}</div>
                        </CardContent>
                        </Card>
                        <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                            Lounge Qty
                            </CardTitle>
                            <PackageOpen className="h-5 w-5" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stockLounge}</div>
                        </CardContent>
                        </Card>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="col-span-4">
                        <CardHeader>
                            <CardTitle>Overview</CardTitle>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <Overview />
                        </CardContent>
                        </Card>
                        <Card className="col-span-3">
                        <CardHeader>
                            <CardTitle>Recent Sales</CardTitle>
                            <CardDescription>
                            You made 265 sales this month.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {/* <RecentSales /> */}
                        </CardContent>
                        </Card>
                    </div>
                    </TabsContent>
                </Tabs>
                </div>
            </div>
        </div>
    );
}