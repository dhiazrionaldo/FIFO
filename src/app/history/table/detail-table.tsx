'use client'
import { Badge } from "@/components/ui/badge";
import {
    Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table"
import axios from "axios";
import { Loader2 } from "lucide-react";
import React, { useEffect } from "react";

interface DetailTableProps {
    kode_sku: string;
    from: Date | undefined;
    to: Date | undefined;
  }

export function DetailTable ({ kode_sku, from, to }: DetailTableProps){
    
    const [data, setData] = React.useState<any[]>([]); 
    const [isLoading, setLoading] = React.useState(false);

    async function getData() {
        setLoading(true);
    
        const params = { 
            kode_sku: kode_sku,
            from: from,
            to: to
        };
    
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/api/history/getDetail`, { params });
            const formattedData = res.data.items.map((row: { transaction_date: string | number | Date; }) => {
                const date = new Date(row.transaction_date);
    
                // Define an array of month abbreviations
                const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
                // Extract day, month, and year
                const day = String(date.getUTCDate()).padStart(2, '0');
                const month = monthNames[date.getUTCMonth()]; // Get month abbreviation
                const year = date.getUTCFullYear();
    
                // Return formatted date along with the rest of the row data
                return {
                    ...row,
                    formattedDate: `${day} ${month} ${year}`,  // Add formatted date to the data
                };
            });
    
            setData(formattedData);  // Store the data with formatted dates
            setLoading(false);
        } catch (error) { // Store the data with formatted dates
            setLoading(false);
            console.error(error)
        }
    }
    
    useEffect(()=>{
        getData();
    },[]);

    return ( 
        <>
            {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
            ): (
                <>
                <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>SKU Code</TableHead>
                        <TableHead>Item Name</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Transaction Type</TableHead>
                        <TableHead>Before Qty</TableHead>
                        <TableHead>Transaction Qty</TableHead>
                        <TableHead>Storage Qty</TableHead>
                        <TableHead>Order Qty</TableHead>
                        <TableHead>Lounge Qty</TableHead>
                        <TableHead>Modified By</TableHead>
                        </TableRow>
                    </TableHeader>
                {data.length ? (
                    data.map((detail) => (  
                            <TableBody key={detail.id}>
                                <TableRow >
                                    <TableCell>{detail.kode_sku}</TableCell>
                                    <TableCell>{detail.item_name}</TableCell>
                                    <TableCell>{detail.formattedDate}</TableCell>
                                    <TableCell>
                                        <>
                                        {detail.transaction_type == 'DELIVER TO LOUNGE' && (
                                            <div><Badge className="text-white bg-green-700">{detail.transaction_type}</Badge></div>
                                        )}
                                        {detail.transaction_type == 'LOUNGE ORDER' && (
                                            <div><Badge className="text-white bg-yellow-500">{detail.transaction_type}</Badge></div>
                                        )}
                                        {detail.transaction_type == 'STORAGE IN' && (
                                            <div><Badge className="text-white">{detail.transaction_type}</Badge></div>
                                        )}
                                        </>
                                    </TableCell>
                                    <TableCell>{detail.before_qty}</TableCell>
                                    <TableCell>{detail.transaction_qty}</TableCell>
                                    <TableCell>{detail.storage_qty}</TableCell>
                                    <TableCell>{detail.order_qty}</TableCell>
                                    <TableCell>{detail.lounge_qty}</TableCell>
                                    <TableCell>{detail.modified_by}</TableCell>
                                </TableRow>
                            </TableBody>
                    ))
                ) : (
                    <TableRow>
                        <TableCell>No Result.</TableCell>
                    </TableRow>
                )}
                </Table>
                </>
            )}
        </>
    );
}