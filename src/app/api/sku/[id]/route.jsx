import { getSKUbyId } from '@/lib/db/sku/sku_db';
import { NextResponse } from "next/server";

export const maxDuration = 60;

export async function GET(req, { params }) {
    const {id} = params;
    try {
      const result = await getSKUbyId(id);
      return NextResponse.json({result},{status:200});
    } catch (error) {
      return NextResponse.json({status: 500}, {error: error.message});
    }
  }