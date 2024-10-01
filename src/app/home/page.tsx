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
import { useMediaQuery } from 'usehooks-ts';

export const fetchCache = 'force-no-store';
export const maxDuration = 60;

export default function HomePage(){ const today = new Date();
    const firstDate = new Date(today.getFullYear(), today.getMonth(), 1);
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
      from: firstDate,
      to: addDays(today, 1),
    });
    const [loading, setLoading] = useState(false);
    const [expenseStorage, setExpenseStorage] = useState('');
    const [expenseLounge, setExpenseLounge] = useState('');
    const [waistedExpenseLounge, setWaistedExpenseLounge] = useState('');
    const [waistedExpenseStorage, setWaistedExpenseStorage] = useState('');
    const [waistedLounge, setWaistedLounge] = useState(0);
    const [waistedStorage, setWaistedStorage] = useState(0);
    const [stockLounge, setStockLounge] = useState(0);
    const [stockStorage, setStockStorage] = useState(0);
    const isDesktop = useMediaQuery("(min-width: 768px)")

    const fetchData = async () => {
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
            const waistedExpense = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/api/dashboard/getSummary`, { params });
    
            // Loop through the response array to set values based on the source field
            waistedExpense.data.items.forEach((item: { source: string; total_price: number; total_qty: number; summary_type: string; }) => {
                const { source, total_price, total_qty, summary_type } = item;
    
                const formattedCurrency = new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                }).format(total_price);
                
                if (source === 'STORAGE' && summary_type === 'WAISTED_EXPENSE') {
                    setWaistedExpenseStorage(formattedCurrency);
                } else if (source === 'LOUNGE' && summary_type === 'WAISTED_EXPENSE') {
                    setWaistedExpenseLounge(formattedCurrency);
                }
                else if (source === 'STORAGE' && summary_type === 'WAISTED') {
                    setWaistedStorage(total_qty);
                } else if (source === 'LOUNGE' && summary_type === 'WAISTED') {
                    setWaistedLounge(total_qty);
                }
                else if (source === 'STORAGE' && summary_type === 'STOCKS') {
                    setStockStorage(total_qty);
                } 
                else if (source === 'LOUNGE' && summary_type === 'STOCKS') {
                    setStockLounge(total_qty);
                }
                
                else if (source === 'STORAGE' && summary_type === 'EXPENSE') {
                    setExpenseStorage(formattedCurrency);
                } else if (source === 'LOUNGE' && summary_type === 'EXPENSE') {
                    setExpenseLounge(formattedCurrency);
                }
            });
    
            setLoading(false);
        } catch (error) {
            console.error("Error fetching data:", error);
            setLoading(false);
        }
    }
    useEffect(() => {
       fetchData()
    }, []);

    if(isDesktop){
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
                            <Button className="text-white" onClick={fetchData}>
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
                                <div className="text-2xl font-bold">{loading ? <Loader2 className="animate-spin"/> :expenseStorage}</div>
                            </CardContent>
                            </Card>
                            <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                Waisted Storage Expense
                                </CardTitle>
                                <Warehouse className="w-5 h-5"/>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{loading ? <Loader2 className="animate-spin"/> :waistedExpenseStorage}</div>
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
                                <div className="text-2xl font-bold">{loading ? <Loader2 className="animate-spin"/> :expenseLounge}</div>
                            </CardContent>
                            </Card>
                            <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                Waisted Lounge Expense
                                </CardTitle>
                                <Martini className="w-5 h-5"/>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{loading ? <Loader2 className="animate-spin"/> :waistedExpenseLounge}</div>
                            </CardContent>
                            </Card>
                            <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                Waisted Storage 
                                </CardTitle>
                                <PackageOpen className="h-5 w-5" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{loading ? <Loader2 className="animate-spin"/> :waistedStorage}</div>
                            </CardContent>
                            </Card>
                            <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Storage Qty</CardTitle>
                                <Boxes className="w-5 h-5" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{loading ? <Loader2 className="animate-spin"/> :stockStorage}</div>
                            </CardContent>
                            </Card>
                            <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                Waisted Lounge 
                                </CardTitle>
                                <PackageOpen className="h-5 w-5" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{loading ? <Loader2 className="animate-spin"/> :waistedLounge}</div>
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
                                <div className="text-2xl font-bold">{loading ? <Loader2 className="animate-spin"/> :stockLounge}</div>
                            </CardContent>
                            </Card>
                            
                        </div>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                            <Card className="col-span-5">
                            <CardHeader>
                                <CardTitle>Monthly Expense Overview</CardTitle>
                            </CardHeader>
                            <CardContent className="pl-2">
                                <Overview />
                            </CardContent>
                            </Card>
                            {/* <Card className="col-span-3">
                            <CardHeader>
                                <CardTitle>Recent Sales</CardTitle>
                                <CardDescription>
                                You made 265 sales this month.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <RecentSales />
                            </CardContent>
                            </Card> */}
                        </div>
                        </TabsContent>
                    </Tabs>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-3xl font-semibold capitalize">Dashboard</h1>
            <div className="mt-3 justify-between">
                <div className="flex flex-col md:flex-row flex-center gap-2 m-3">
                    <DatePickerWithRange date={dateRange} setDate={setDateRange} />
                    <Button className="text-white" onClick={fetchData}>
                        {loading ? <Loader2 className="animate-spin" /> : <Search />}
                    </Button>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                        Storage Expense
                        </CardTitle>
                        <Warehouse className="w-5 h-5"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{loading ? <Loader2 className="animate-spin"/> :expenseStorage}</div>
                    </CardContent>
                    </Card>
                    <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                        Waisted Storage Expense
                        </CardTitle>
                        <Warehouse className="w-5 h-5"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{loading ? <Loader2 className="animate-spin"/> :waistedExpenseStorage}</div>
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
                        <div className="text-2xl font-bold">{loading ? <Loader2 className="animate-spin"/> :expenseLounge}</div>
                    </CardContent>
                    </Card>
                    <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                        Waisted Lounge Expense
                        </CardTitle>
                        <Martini className="w-5 h-5"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{loading ? <Loader2 className="animate-spin"/> :waistedExpenseLounge}</div>
                    </CardContent>
                    </Card>
                    <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                        Waisted Storage 
                        </CardTitle>
                        <PackageOpen className="h-5 w-5" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{loading ? <Loader2 className="animate-spin"/> :waistedStorage}</div>
                    </CardContent>
                    </Card>
                    <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Storage Qty</CardTitle>
                        <Boxes className="w-5 h-5" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{loading ? <Loader2 className="animate-spin"/> :stockStorage}</div>
                    </CardContent>
                    </Card>
                    <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                        Waisted Lounge 
                        </CardTitle>
                        <PackageOpen className="h-5 w-5" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{loading ? <Loader2 className="animate-spin"/> :waistedLounge}</div>
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
                        <div className="text-2xl font-bold">{loading ? <Loader2 className="animate-spin"/> :stockLounge}</div>
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
                        {/* <Card className="col-span-3">
                        <CardHeader>
                            <CardTitle>Recent Sales</CardTitle>
                            <CardDescription>
                            You made 265 sales this month.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                             <RecentSales /> 
                        </CardContent>
                        </Card> */}
                    </div>
                </div>
        </div>
    );
    
}