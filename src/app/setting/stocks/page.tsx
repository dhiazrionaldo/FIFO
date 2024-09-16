"use client";
import { settingStockMaster, columns } from "./table/columns";
import axios from 'axios'
import { DataTable } from "./table/data-table";
import {CreateStockMaster} from "./table/create-stock-master"
import { useEffect, useState } from "react";

export const maxDuration = 60;

export default async function settingItemPage() {
  
  const [data, setData] = useState<any[]>([]);

  async function getItemMasterData(){
    const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/api/item_master`);
    const data = res.data.items;

    setData(data);
    return data
  }

  useEffect(() => {
    getItemMasterData();
  }, []);

  return (
    <div>
      <h1 className='text-3xl font-semibold capitalize'>Stock Settings</h1>
      <div className="mt-3 justify-between">
        <DataTable columns={columns} data={data}/>
      </div>
    </div>
  );
}
