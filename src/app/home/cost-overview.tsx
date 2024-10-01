"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import toast from "react-hot-toast";
import axios from "axios";
import { useEffect, useState } from "react";

export const description = "Lounge Expense Overview"

export const fetchCache = 'force-no-store';
export const maxDuration = 60;

const chartConfig = {
  storage: {
    label: "Storage",
    color: "hsl(var(--chart-1))",
  },
  lounge: {
    label: "Lounge",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

export function Overview() {
  const [chartData, setData] = useState<any[]>([]);

  const getStorageExpenseOverview = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/api/dashboard/getStorageExpenseOverview`)
      setData(res.data.items);
    } catch (error) {
      console.log('error: '+error);
      toast.error('Error fetching chart!')
    }
  }
  useEffect(() => {
    getStorageExpenseOverview();
  }, []);

  return (
    <ChartContainer config={chartConfig}>
      <BarChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <YAxis
          stroke="#888888"
          fontSize={7.5}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
          }).format(value)}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="dashed" />}
        />
        <Bar dataKey="storage" fill="var(--color-storage)" radius={4} />
        <Bar dataKey="lounge" fill="var(--color-lounge)" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}

// "use client"

// import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
// import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
// import { ChartTooltip } from "@/components/ui/chart"
// import toast from "react-hot-toast";
// import axios from "axios";
// import { useEffect, useState } from "react";

// // const data = [
// //   {
// //     name: "Jan",
// //     total: Math.floor(Math.random() * 5000),
// //   },
// //   {
// //     name: "Feb",
// //     total: Math.floor(Math.random() * 5000),
// //   },
// //   {
// //     name: "Mar",
// //     total: Math.floor(Math.random() * 5000),
// //   },
// //   {
// //     name: "Apr",
// //     total: Math.floor(Math.random() * 5000),
// //   },
// //   {
// //     name: "May",
// //     total: Math.floor(Math.random() * 5000),
// //   },
// //   {
// //     name: "Jun",
// //     total: Math.floor(Math.random() * 5000),
// //   },
// //   {
// //     name: "Jul",
// //     total: Math.floor(Math.random() * 5000),
// //   },
// //   {
// //     name: "Aug",
// //     total: Math.floor(Math.random() * 5000),
// //   },
// //   {
// //     name: "Sep",
// //     total: Math.floor(Math.random() * 5000),
// //   },
// //   {
// //     name: "Oct",
// //     total: Math.floor(Math.random() * 5000),
// //   },
// //   {
// //     name: "Nov",
// //     total: Math.floor(Math.random() * 5000),
// //   },
// //   {
// //     name: "Dec",
// //     total: Math.floor(Math.random() * 5000),
// //   },
// // ]

// export function Overview() {
//   const [data, setData] = useState<any[]>([]);

//   const getStorageExpenseOverview = async () => {
//     try {
//       const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/api/dashboard/getStorageExpenseOverview`)
//       setData(res.data.items);
//     } catch (error) {
//       console.log('error: '+error);
//       toast.error('Error fetching chart!')
//     }
//   }

//   useEffect(() => {
//     getStorageExpenseOverview();
//   }, []);

//   return (
//     <ResponsiveContainer width="100%" height={350}>
//       <BarChart data={data}>
//         <XAxis
//           dataKey="Month"
//           stroke="#888888"
//           fontSize={9}
//           tickLine={false}
//           axisLine={false}
//         />
//         <YAxis
//           stroke="#888888"
//           fontSize={9}
//           tickLine={false}
//           axisLine={false}
//           tickFormatter={(value) => `Rp${value}`}
//         />
//         <Bar
//           dataKey="total"
//           fill="currentColor"
//           radius={[4, 4, 0, 0]}
//           className="fill-primary"
//         />
//       </BarChart>
//     </ResponsiveContainer>
//   )
// }
