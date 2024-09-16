import { getItembyId } from '@/lib/db/item_master/item_master';
import { NextResponse } from "next/server";

export const maxDuration = 60;

export async function GET(req, { params }) {
    const {id} = params;
    try {
      const result = await getItembyId(id);
      return NextResponse.json({result},{status:200});
    } catch (error) {
      return NextResponse.json({status: 500}, {error: error.message});
    }
  }