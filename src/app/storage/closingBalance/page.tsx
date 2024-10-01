"use client";

import { Button } from '@/components/ui/button';
import { ArrowLeft, ListCheck, Loader2, MinusCircleIcon, PlusCircleIcon } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { StorageDrawerDialog } from '@/app/storage/openingBalance/storage_list';
import { Input } from '@/components/ui/input';
import { useSelectedRow } from '@/app/storage/selected-row-provider';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import toast from 'react-hot-toast';
import { Label } from '@/components/ui/label';
import { useMediaQuery } from 'usehooks-ts';
import { useUser } from '@clerk/nextjs';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export const fetchCache = 'force-no-store';
export const maxDuration = 60;

const StorageOpeningBalancePage = () => {
  const { selectedRows, clearSelectedRows } = useSelectedRow();
  const [formattedRows, setFormattedRows] = useState(selectedRows);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [topQty, setTopQty] = useState(''); 
  const [exceedIndex, setExceedIndex] = useState<number | null>(null);// Track the index of the exceeded card
  const { user } = useUser();
  const username = user?.username;
  const router = useRouter();
  const [isLoading, setLoading] = useState(false);
  

  // Submit Order
  async function submitClosingBalance() {
    let isExceed = false;
    setLoading(true);
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
    if (isExceed) {
        setLoading(false); 
        return
    };

    // Submit the order if no validation errors
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_API_BASE}/api/storage/closingBalance`, updatedRows)
        .then(() => {
          setLoading(false);
          toast.success('Success Update Closing Balance!');
        })
        .finally(() => {
          router.push('/storage'); 
          clearSelectedRows(); 
        });
    } catch (error) {
      toast.error('Failed! Please try again later.');
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
        <Link href='/storage'>
          <Button variant='outline' onClick={() => {
             clearSelectedRows(); 
          }}>
            <ArrowLeft className='gap-2' />Back
          </Button>
        </Link>
        <h1 className="text-3xl font-semibold capitalize">Storage Closing Balance</h1>
      </div>
      
      <div className="mt-10 justify-between items-center">
        <div className='flex justify-between gap-4 items-center'>
          <StorageDrawerDialog />

          <div className='flex flex-col items-center'>
            <Label className='text-xl font-bold'>Qty</Label>
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
          
          {isLoading ? (
            <Loader2 className='animate-spin h-5 w-5'/>
          ) : (
            <Button className='text-white gap-3' onClick={submitClosingBalance}>
                <ListCheck className='w-5 h-5' />SUBMIT
            </Button>
          )}
          
        </div>

        {formattedRows.length > 0 ? (
          formattedRows.map((row, index) => (
            <Card 
              key={index}
              className={`mx-2 my-2 py-4 px-4 text-white w-full ${index === exceedIndex ? 'animate-pulse duration-90 bg-gray-700 text-white exceed-card' : ''}`}
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
            <p className='py-2'>Please choose the storage stock first before proceeding</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StorageOpeningBalancePage;