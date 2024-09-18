"use client";

import { Button } from '@/components/ui/button';
import { ArrowLeft, ListCheck, MinusCircleIcon, PlusCircleIcon } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { StorageDrawerDialog } from '@/app/order/create/storage_list';
import { Input } from '@/components/ui/input';
import { useSelectedRow } from '@/app/order/selected-row-provider';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import toast from 'react-hot-toast';
import { Label } from '@/components/ui/label';
import { useMediaQuery } from 'usehooks-ts';
import { useUser } from '@clerk/nextjs';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const LoungeorderPage = () => {
  const { selectedRows } = useSelectedRow();
  const [formattedRows, setFormattedRows] = useState(selectedRows);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [topQty, setTopQty] = useState(''); 
  const [exceedIndex, setExceedIndex] = useState<number | null>(null);// Track the index of the exceeded card
  const { user } = useUser();
  const username = user?.username;
  const router = useRouter();

  // Submit Order
  async function submitOrder() {
    let isExceed = false;

    // Validate topQty with storage qty before submission
    const updatedRows = formattedRows.map((row, index) => {
      if (parseInt(topQty) > row.qty) {
        toast.error(`Order quantity for ${row.item_name} exceeds available stock!`);
        setExceedIndex(index); // Set the exceeded card index for animation
        isExceed = true;
      }

      return {
        ...row,
        created_by: username!,
        qty: parseInt(topQty), // Update qty with the input value
      };
    });

    // If there's any exceeded qty, don't submit the order
    if (isExceed) return;

    // Submit the order if no validation errors
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_BASE}/api/order`, updatedRows)
        .then(() => {
          toast.success('Success Add Lounge Order!');
        })
        .finally(() => {
          router.push('/order');
        });
    } catch (error) {
      toast.error('Failed to add Order! Please try again later.');
      console.log(error);
    }
  }

  // Effect to format rows and update qty from selectedRows
  useEffect(() => {
    if (selectedRows.length > 0) {
      const formattedData = selectedRows.map(row => {
        const formattedPrice = new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
          minimumFractionDigits: 0,
        }).format(row.unit_price || 0);

        return {
          ...row,
          formattedPrice,
        };
      });

      setFormattedRows(formattedData);
    }
  }, [selectedRows]);

  return (
    <div>
      <div className='flex flex-row gap-3'>
        <Link href='/order'>
          <Button variant='outline'>
            <ArrowLeft className='gap-2' />Back
          </Button>
        </Link>
        <h1 className="text-3xl font-semibold capitalize">Create Order</h1>
      </div>
      
      <div className="mt-10 justify-between items-center">
        <div className='flex justify-between gap-4 items-center'>
          <StorageDrawerDialog />

          <div className='flex flex-col items-center'>
            <Label className='text-xl font-bold'>Order Qty</Label>
            <div className='flex items-center gap-4'>
              <Button className='text-white rounded-full max-w-[40px] p-2' onClick={() => {
                const minusQty = parseInt(topQty) - 1;
                setTopQty(minusQty.toString());
              }}>
                <MinusCircleIcon className='w-5 h-5' />
              </Button>
              <Input id="qty" value={topQty} type='number' className="col-span-3" onChange={(e) => setTopQty(e.target.value)} />
              <Button className='text-white rounded-full max-w-[40px] p-2' onClick={() => {
                const plusQty = parseInt(topQty) + 1;
                setTopQty(plusQty.toString());
              }}>
                <PlusCircleIcon className='w-5 h-5' />
              </Button>
            </div>
          </div>

          <Button className='text-white gap-3' onClick={submitOrder}>
            <ListCheck className='w-5 h-5' />ORDER
          </Button>
        </div>

        {formattedRows.length > 0 ? (
          formattedRows.map((row, index) => (
            <Card 
              key={index}
              className={`mx-2 my-2 py-4 px-4 text-white w-full ${index === exceedIndex ? 'animate-bounce exceed-card' : ''}`}
            >
              <CardTitle className='mb-4 text-xl font-bold'>SKU No : {row.kode_sku}</CardTitle>
              <CardContent className="grid grid-cols-2 gap-6">
                <div className='grid grid-row-2'>
                  <label className='block text-md font-bold'>Item</label>
                  <Input disabled value={row.item_name || ''} className='mt-1 border-gray-700 block w-fit' />
                  <label className='block text-md font-bold'>Category</label>
                  <Input disabled value={row.category_name || ''} className='mt-1 border-gray-700 block w-fit' />
                </div>
                <div className='grid grid-row-2 gap-3'>
                  <label className='block text-md font-bold'>Storage Qty.</label>
                  <Input disabled value={row.qty || ''} className='mt-1 border-gray-700 block w-fit' />
                  <label className='block text-md font-bold'>Price</label>
                  <Input disabled value={row.formattedPrice || ''} className='mt-1 border-gray-700 block w-fit' />
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div>
            <p>No items selected.</p>
            <p className='py-2'>Please choose the storage stock first before proceeding to order</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoungeorderPage;

// /* eslint-disable react/jsx-key */
// "use client";

// import { Button } from '@/components/ui/button'
// import { ArrowLeft, ListCheck, MinusCircleIcon, PlusCircleIcon } from 'lucide-react'
// import Link from 'next/link'
// import React, { useEffect, useState } from 'react'
// import { StorageDrawerDialog } from '@/app/order/create/storage_list'
// import { Input } from '@/components/ui/input'
// import { useSelectedRow } from '@/app/order/selected-row-provider'
// import { Card, CardContent, CardTitle } from '@/components/ui/card';
// import toast from 'react-hot-toast';
// import { Label } from '@/components/ui/label';
// import { useMediaQuery } from 'usehooks-ts';
// import { useUser } from '@clerk/nextjs';
// import axios from 'axios';
// import { redirect, useRouter } from 'next/navigation'

// const LoungeorderPage = () => {
//     const { selectedRows } = useSelectedRow();
//     const [formattedRows, setFormattedRows] = useState(selectedRows);
//     const isDesktop = useMediaQuery("(min-width: 768px)")
//     const [totalPrice, setTotalPrice] = useState('');
//     const [item_id, setItemId] = useState('');
//     const [id, setId] = useState('');
//     const [qty, setQty] = useState('');
//     const [storage_id, setStorageId] = useState('');
//     const [topQty, setTopQty] = useState(''); 
//     const { user } = useUser();
//     const username = user?.username;
//     const router = useRouter();

//     async function submitOrder() {
//         const updatedRows = formattedRows.map((row) => ({
//         ...row,
//         item_id: row.item_id,
//         created_by: username!,
//         price: totalPrice,
//         storage_id: storage_id,
//         qty: parseInt(topQty) //row.item_id === item_id ? topQty : row.qty, // Update qty before sending to API
//         })); 

//         try {
//             await axios.post(`${process.env.NEXT_PUBLIC_API_BASE}/api/order`, updatedRows)
//                        .then(()=>{
//                         toast.success('Success Add Lounge Order!');
//                        })
//                        .catch((er)=>{
//                         toast.error(er);
//                        })
//                        .finally(()=>{
//                         router.push('/order')
//                        });
//         } catch (error) {
//             toast.error('Failed to add Order! Please try again later')
//             console.log(error)
//         }
//     }

//     useEffect(() => {
//         if (selectedRows.length > 0) {
//         const formattedData = selectedRows.map(row => {
//             // Format the price for each row
//             const formattedPrice = new Intl.NumberFormat('id-ID', {
//             style: 'currency',
//             currency: 'IDR',
//             minimumFractionDigits: 0,
//             }).format(row.unit_price || 0);

//             return {
//             ...row,
//             formattedPrice, // Add the formatted price to each row
//             };
//         });

//         setFormattedRows(formattedData); // Update the state with the formatted data

//         //set all storage data
//         selectedRows.map((row) => {
//             setItemId(row.item_id);
//             setTotalPrice(row.total_price);
//             setStorageId(row.id);
//             setId(row.id);
//         })
//         }
//     }, [selectedRows]);


//     if (isDesktop) {
//         return (
//           <div>
//             <div className='flex flex-row gap-3'>
//                 <Link href='/order'>
//                 <Button variant='outline'><ArrowLeft className='gap-2' />Back</Button>
//                 </Link>
//                 <h1 className="text-3xl font-semibold capitalize">Create Order</h1>
//             </div>
//             <div className="mt-10 justify-between items-center">
//                 <div className='flex justify-between gap-4 items-center'>
//                 {/* Center the StorageDrawerDialog, Order Button, and Order Qty section */}
//                 <StorageDrawerDialog />

//                 {/* Center the OrderQty label and buttons */}
//                 <div className='flex flex-col items-center'>
//                     <Label className='text-xl font-bold'>Order Qty</Label>
//                     <div className='flex items-center gap-4'>
//                     <Button className='text-white rounded-full max-w-[40px] p-2' onClick={() => {
//                         const minusQty = parseInt(topQty)-1;
//                         setTopQty(minusQty.toString())
//                     }}>
//                         <MinusCircleIcon className='w-5 h-5' />
//                     </Button>
//                     <Input id="qty" value={topQty} type='number' className="col-span-3" onChange={(e) => {
//                         const newQty = e.target.value;
//                         setTopQty(newQty);
                    
//                         // Update only the `qty` field in formattedRows
//                         const updatedRows = formattedRows.map((row) => ({
//                           ...row,
//                           qty: row.qty
                          
//                         }));
                        
                    
//                         setFormattedRows(updatedRows);
//                     }} />
//                     {/* <Input className='text-xl font-bold text-center w-[80px]' value={qty} id="qty"/> */}
//                     <Button className='text-white rounded-full max-w-[40px] p-2' onClick={()=>{
//                         const plusQty = parseInt(topQty)+1
//                         setTopQty(plusQty.toString())
//                     }}>
//                         <PlusCircleIcon className='w-5 h-5' />
//                     </Button>
//                     </div>
//                 </div>

//                 {/* Order Button */}
//                 <Button className='text-white gap-3' onClick={submitOrder}>
//                     <ListCheck className='w-5 h-5' />ORDER
//                 </Button>
//                 </div>

//                 {formattedRows.length > 0 ? (
//                 formattedRows.map((row, index) => (
//                     <Card 
//                     key={index}
//                     className='mx-2 my-2 py-4 px-4 text-white w-full sm:w-full md:w-[100%] lg:w-[100%]' // Full width on mobile, narrower on larger screens
//                     >
//                     <CardTitle className='mb-4 text-xl font-bold'>SKU No : {row.kode_sku}</CardTitle>
//                     <CardContent className="grid grid-cols-2 gap-6">
//                         <div className='grid grid-row-2'>
//                         <label className='block text-md font-bold'>
//                             Item
//                         </label>
//                         <Input disabled value={row.item_name || ''} className='mt-1 border-gray-700 block w-fit' />
//                         <label className='block text-md font-bold'>
//                             Category
//                         </label>
//                         <Input disabled value={row.category_name || ''} className='mt-1 border-gray-700 block w-fit' />
//                         </div>
//                         <div className='grid grid-row-2 gap-3'>
//                         <label className='block text-md font-bold'>
//                             Storage Qty.
//                         </label>
//                         <Input disabled value={row.qty || ''} className='mt-1 border-gray-700 block w-fit' />
//                         <label className='block text-md font-bold'>
//                             Price
//                         </label>
//                         <Input disabled value={row.formattedPrice || ''} className='mt-1 border-gray-700 block w-fit' />
//                         </div>
//                     </CardContent>
//                     </Card>
//                 ))
//                 ) : (
//                     <div>
//                         <p>No items selected.</p>                        
//                         <p className='py-2'>Please choose the storage stock first before proceeding to order</p>
//                     </div>
//                 )}
//             </div>
//           </div>
//         )
//       }
//       return (
//         <div>
//             <div className='flex flex-row gap-3'>
//                 <Link href='/lounge'>
//                     <Button variant='outline'>
//                         <ArrowLeft className='gap-2'/>Back
//                     </Button>
//                 </Link>
//                 <h1 className="text-3xl font-semibold capitalize">Create Order</h1>
//             </div>

//             <div className="mt-10 justify-between items-center">
//                 {/* Responsive Layout Adjustment */}
//                 <div className='flex flex-col md:flex-row justify-between gap-4'>
//                     {/* Show Storage Drawer above "Order Qty" on mobile */}
//                     <div className='w-full md:w-auto'>
//                         <StorageDrawerDialog />
//                     </div>

//                     {/* Order Qty Group */}
//                     <div className='grid grid-rows-2 w-full md:w-auto'>
//                         <Label className='text-xl font-bold'>Order Qty</Label>
//                         <div className='grid grid-cols-3 items-center gap-2'>
//                             <Button className='text-white rounded-full max-w-[50px]'>
//                                 <PlusCircleIcon />
//                             </Button>
//                             <Input className='text-xl font-bold max-w-[100px]' />
//                             <Button className='text-white rounded-full max-w-[50px]'>
//                                 <PlusCircleIcon />
//                             </Button>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Order Button should be below "Order Qty" div on mobile */}
//                 <div className='w-full mt-4 md:mt-0 md:w-auto'>
//                     <Button 
//                         className='w-full md:w-auto text-white gap-3' 
//                         onClick={() => { toast.error('on progress') }}
//                     >
//                         <ListCheck className='w-5 h-5'/>ORDER
//                     </Button>
//                 </div>

//                 {/* Cards */}
//                 {formattedRows.length > 0 ? (
//                     formattedRows.map((row, index) => (
//                         <Card className='mx-2 my-2 py-4 px-4 text-white w-full md:w-auto'>
//                             <CardTitle className='mb-4 text-xl font-bold'>SKU No : {row.kode_sku}</CardTitle>
//                             <CardContent key={index} className="grid grid-cols-2 gap-6">
//                                 <div className='grid grid-row-2'>
//                                     <label className='block text-md font-bold'>Item</label>
//                                     <Input disabled value={row.item_name || ''} className='mt-1 border-gray-700 block w-fit' />
//                                     <label className='block text-md font-bold'>Category</label>
//                                     <Input disabled value={row.category_name || ''} className='mt-1 border-gray-700 block w-fit' />
//                                 </div>
//                                 <div className='grid grid-row-2 gap-3'>
//                                     <label className='block text-md font-bold'>Storage Qty.</label>
//                                     <Input disabled value={row.qty || ''} className='mt-1 border-gray-700 block w-fit' />
//                                     <label className='block text-md font-bold'>Price</label>
//                                     <Input disabled value={row.formattedPrice || ''} className='mt-1 border-gray-700 block w-fit' />
//                                 </div>
//                             </CardContent>
//                         </Card>
//                     ))
//                 ) : (
//                     <div>
//                         <p>No items selected.</p>                        
//                         <p className='py-2'>Please choose the storage stock first before proceeding to order</p>
//                     </div>
                    
//                 )}
//             </div>
//         </div>

//       )  
// }

// export default LoungeorderPage