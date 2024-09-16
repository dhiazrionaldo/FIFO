'use client';
'use client';
import { useEffect, useState } from "react";
import axios from "axios";
import { DataTable } from "./table/data-table";
import { stockIn, columns } from "./table/columns";
import { DatePickerWithRange } from "./dateRange";
import { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { addDays } from "date-fns"; 
import { Loader2, Search, Circle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import toast from "react-hot-toast";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useMediaQuery } from 'usehooks-ts';

export default function StoragePage() {
  const today = new Date();
  const firstDate = new Date(today.getFullYear(), today.getMonth(), 1);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: firstDate,
    to: addDays(today, 1),
  });

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null); // Track selected row
  const [inputQty, setInputQty] = useState(0); // To handle qty input
  const isDesktop = useMediaQuery("(min-width: 768px)")

  const getStockInData = async () => {
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
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/api/storage`, { params });
      setData(res.data.items);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  async function getOrderList() {
    setLoading(true);
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/api/order/getAllOrderList`);
      setOrder(res.data.items);
    } catch (error) {
      toast.error("Error Get Data !");
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getStockInData();
    getOrderList();
  }, []);

  // Handle row click to open dialog with selected row data
  const handleRowClick = (row: any) => {
    setSelectedRow(row);
    setInputQty(row.qty); // Set the qty for the dialog input
    setDialogOpen(true);
  };

  // Handle form submit
  const handleSubmit = async () => {
    if (selectedRow) {
      const updatedRow = {
        ...selectedRow,
        qty: inputQty, // Update the qty field with the new inputQty
      };

      setLoading(true);
      try {
        const res = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE}/api/order/deliverOrder`, updatedRow)
        .then(()=>{
        toast.success('Item Delivered!');        
        setDialogOpen(false); // Close the dialog after submit
        })
        .finally(()=>{
          setLoading(false);
          window.location.reload();
        });
      } catch (error) {
        toast.error('Error submitting data!');
        console.error(error);
      }
    }
  };

  if(isDesktop){
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 grid-rows-1 gap-2">
        <div className="col-span-1 md:col-span-3 row-span-2">
          <div className="grid items-start gap-2">
            <h1 className="text-xl md:text-3xl font-semibold capitalize">Storage</h1>
            <div className="flex flex-col md:flex-row flex-center gap-2 m-3">
              <DatePickerWithRange date={dateRange} setDate={setDateRange} />
              <Button className="text-white" onClick={getStockInData}>
                {loading ? <Loader2 className="animate-spin" /> : <Search />}
              </Button>
            </div>

            <div className="mt-3 justify-between">
              {loading ? (
                <Loader2 className="h-10 w-10 text-blue-600 animate-spin mx-auto" />
              ) : (
                <DataTable columns={columns} data={data} />
              )}
            </div>
          </div>
        </div>

        {/* Summary Order Count Card */}
        <div className="col-span-1 md:col-start-4 gap-4">
          <Card className="mt-4 md:mt-0">
            <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-2 md:space-y-0 pb-2">
              <CardTitle className="text-lg md:text-2xl font-semibold capitalize">
                Total Order
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold text-yellow-500">{order.length}</div>
              <p className="text-xs text-muted-foreground">Waiting to deliver to lounge</p>
            </CardContent>
          </Card>

          {/* Lounge Order Card List */}
          <Card className="grid gap-3 py-2 px-2 overflow-auto mt-3 max-h-[300px] md:max-h-[500px]">
            <CardTitle>
              <h1 className="text-lg md:text-2xl font-semibold capitalize p-3">Lounge Order List</h1>
            </CardTitle>
            <CardContent>
              {order.length > 0 ? (
                order.map((row, index) => (
                  <div
                    key={index}
                    onClick={() => handleRowClick(row)}
                    className="flex flex-col md:flex-row items-start space-y-2 md:space-y-0 space-x-0 md:space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground cursor-pointer"
                  >
                    <Circle className="h-5 w-5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">Kode SKU</p>
                      <p className="text-sm text-muted-foreground">{row.kode_sku}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">Item Name</p>
                      <p className="text-sm text-muted-foreground">{row.item_name}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium leading-none">Order Qty</p>
                      <p className="text-sm text-muted-foreground">{row.qty}</p>
                    </div>
                  </div>
                ))
              ) : (
                <Card>
                  <CardContent>
                    <div>No Order</div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Dialog for Input Qty */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Order Quantity</DialogTitle>
            </DialogHeader>
            {selectedRow && (
              <div>
                <p>Item: {selectedRow.item_name}</p>
                <Input
                  type="number"
                  value={inputQty}
                  onChange={(e) => setInputQty(Number(e.target.value))}
                  className="mb-4"
                />
              </div>
            )}
            <DialogFooter>
              {loading ? (
                <Loader2 className="h-10 w-10 text-blue-600 animate-spin mx-auto" />
              ) : (
                <Button onClick={handleSubmit}>Submit</Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }
  return (
    // <div className="grid grid-cols-1 md:grid-cols-3 grid-rows-1 gap-2">
      <div className="md:col-span-3 row-span-2">
         {/* Summary Order Count Card */}
        <div className="col-span-1 md:col-start-4 gap-4">
          <Card className="mt-4 md:mt-0">
            <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-2 md:space-y-0 pb-2">
              <CardTitle className="text-lg md:text-2xl font-semibold capitalize">
                Total Order
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold text-yellow-500">{order.length}</div>
              <p className="text-xs text-muted-foreground">Waiting to deliver to lounge</p>
            </CardContent>
          </Card>

          {/* Lounge Order Card List */}
          <Card className="py-2 px-2 mt-3 max-h-[500px] md:max-h-[500px] overflow-y-auto">
            <CardTitle>
              <h1 className="text-lg md:text-2xl font-semibold capitalize p-3">Lounge Order List</h1>
            </CardTitle>
            <CardContent className="space-y-2">
              {order.length > 0 ? (
                order.map((row, index) => (
                  <div
                    key={index}
                    onClick={() => handleRowClick(row)}
                    className="bg-gray-900 -mx-2 flex flex-col md:flex-row items-start space-y-2 md:space-y-0 space-x-0 md:space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground cursor-pointer"
                  >
                    <Circle className="h-5 w-5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">Kode SKU</p>
                      <p className="text-sm text-muted-foreground">{row.kode_sku}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">Item Name</p>
                      <p className="text-sm text-muted-foreground">{row.item_name}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium leading-none">Order Qty</p>
                      <p className="text-sm text-muted-foreground">{row.qty}</p>
                    </div>
                  </div>
                ))
              ) : (
                <Card>
                  <CardContent>
                    <div>No Order</div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Dialog for Input Qty */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Order Quantity</DialogTitle>
            </DialogHeader>
            {selectedRow && (
              <div>
                <p>Item: {selectedRow.item_name}</p>
                <Input
                  type="number"
                  value={inputQty}
                  onChange={(e) => setInputQty(Number(e.target.value))}
                  className="mb-4"
                />
              </div>
            )}
            <DialogFooter>
              {loading ? (
                <Loader2 className="h-10 w-10 text-blue-600 animate-spin mx-auto" />
              ) : (
                <Button onClick={handleSubmit}>Submit</Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
          <div className="grid items-start gap-2">
            <h1 className="text-xl md:text-3xl font-semibold capitalize">Storage</h1>
            <div className="flex flex-col md:flex-row flex-center gap-2 m-3">
              <DatePickerWithRange date={dateRange} setDate={setDateRange} />
              <Button className="text-white" onClick={getStockInData}>
                {loading ? <Loader2 className="animate-spin" /> : <Search />}
              </Button>
            </div>
          </div>
          <div className="mt-3 justify-between">
            {loading ? (
              <Loader2 className="h-10 w-10 text-blue-600 animate-spin mx-auto" />
            ) : (
              <DataTable columns={columns} data={data} />
            )}
          </div>
      </div>
      
    // </div>
  );
  
}



// /* eslint-disable react/jsx-key */
// "use client";

// import { useEffect, useState } from "react";
// import axios from "axios";
// import { DataTable } from "./table/data-table";
// import { stockIn, columns } from "./table/columns";
// import { DatePickerWithRange } from "./dateRange";
// import { DateRange } from "react-day-picker";
// import { Button } from "@/components/ui/button"; // Assuming this is the Button component you're using
// import { addDays, format } from "date-fns"; // Import date manipulation function
// import { BellIcon, Circle, Loader2, Search } from "lucide-react";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import toast from "react-hot-toast";

// export default function StoragePage() {
//   // Set initial date range to the current date
//   const today = new Date();
//   const firstDate = new Date(today.getFullYear(), today.getMonth(),1)
//   const [dateRange, setDateRange] = useState<DateRange | undefined>({
//     from: firstDate,
//     to: addDays(today, 1), // You can set `to` as the same day or next day depending on your requirements
//   });
  
//   const [data, setData] = useState<any[]>([]); // State to store fetched data
//   const [loading, setLoading] = useState(false); // For loading state
//   const [order, setOrder] = useState<any[]>([]);

//   // Function to fetch data based on selected date range
//   const getStockInData = async () => {
//     if (!dateRange?.from || !dateRange?.to) {
//       alert("Please select a date range");
//       return;
//     }
    
//     setLoading(true);
//     try {
//       // Convert date to 'YYYY-MM-DD' format
//       const params = { 
//         from: dateRange?.from?.toISOString(),
//         to: dateRange?.to?.toISOString(),
//       };

//       // API call to get stock data
//       const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/api/storage`, { params });
//       setData(res.data.items);
//     } catch (error) {
//       console.error("Error fetching data:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   async function getOrderList(){
//     setLoading(true)

//     try {
//       const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/api/order/getAllOrderList`)
//       setOrder(res.data.items);
//     } catch (error) {
//       toast.error('Error Get Data !')
//       console.log(error)
//     }
//   }
  
//   useEffect(()=>{
//     getStockInData();
//     getOrderList();
//   },[]);
  
//   return (
//     <div className="grid grid-cols-3 grid-rows-1 gap-2">
//       <div className="col-span-3 row-span-2">
//         <div className="col-span-1 grid items-start gap-2 lg:col-span-1">
//           <h1 className="text-3xl font-semibold capitalize">Storage</h1>
//           <div className="flex flex-center gap-2 m-3">
//             <DatePickerWithRange date={dateRange} setDate={setDateRange} />
//             <Button className="text-white" onClick={getStockInData}>{loading? <Loader2 className="animate-spin"/> : <Search />}</Button>
//           </div>

//           <div className="mt-3 justify-between">
//             {loading ? (
//               <Loader2 className='col-span-3 h-10 w-10 text-blue-600 animate-spin mx-auto' />
//             ) : (
//               <DataTable columns={columns} data={data} />
//             )}
//           </div>
//         </div>
//       </div>
//       <div className="col-start-4 gap-4">
//         {/* Summary Order Count Card */}
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-2xl font-semibold capitalize">
//               Total Order
//             </CardTitle>
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               viewBox="0 0 24 24"
//               fill="none"
//               stroke="currentColor"
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth="2"
//               className="h-4 w-4 text-muted-foreground"
//             >
//               <rect width="20" height="14" x="2" y="5" rx="2" />
//               <path d="M2 10h20" />
//             </svg>
//           </CardHeader>
//           <CardContent>
//             <div className="text-3xl font-bold text-yellow-500">{order.length}</div>
//             <p className="text-xs text-muted-foreground">
//               Waiting to deliver to lounge
//             </p>
//           </CardContent>
//         </Card>
//         {/* Lounge Order Card List */}
//         <Card className="grid gap-3 py-2 px-2 overflow-auto mt-3 max-h-[500px]">
//           <CardTitle><h1 className="text-2xl font-semibold capitalize p-3">Lounge Order List</h1> </CardTitle>
//           <CardContent>
//             {order.length > 0 ? (
//                 order.map((row, index) => (
//                         <div onClick={()=>{ toast.error(`order id: ${row.id}`)}} className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground cursor-pointer">
//                           <Circle className="mt-px h-5 w-5" />
//                           <div className="space-y-1">
//                             <p className="text-sm font-medium leading-none">Kode SKU</p>
//                             <p className="text-sm text-muted-foreground">
//                               {row.kode_sku}
//                             </p>
//                           </div>
//                           <div className="space-y-1">
//                             <p className="text-sm font-medium leading-none">Item Name</p>
//                             <p className="text-sm text-muted-foreground">
//                               {row.item_name}
//                             </p>
//                           </div>
//                           <div className="space-y-2">
//                             <p className="text-sm font-medium leading-none">Order Qty</p>
//                             <p className="text-sm text-muted-foreground">
//                               {row.qty}
//                             </p>
//                           </div>
//                         </div>
//                 ))
//               ) : (
//                 <Card>
//                     <CardContent>
//                       <div>No Order</div>
//                     </CardContent>
//                   </Card>
//               )}
//           </CardContent>
//         </Card>
            
//             {/* <pre>{JSON.stringify(order, null, 2)}</pre> */}
//       </div>
//     </div>
//   );
// }
