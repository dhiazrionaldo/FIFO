import { settingSKU, columns } from "./table/columns";
import axios from 'axios'
import { DataTable } from "./table/data-table";
import {CreateSKU} from "./table/create-sku"

export const maxDuration = 60;

async function getSKUData(){
  const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/api/sku`);
  const data = res.data.items;

  return data
}


export default async function settingSKUPage() {
  const data = await getSKUData();
  return (
    <div>
      <h1 className='text-3xl font-semibold capitalize'>Item Category Settings</h1>
      <div className="mt-3 justify-between">
        <DataTable columns={columns} data={data}/>
      </div>
    </div>
  );
}
