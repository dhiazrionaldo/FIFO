import {deliverOrder} from '@/lib/db/order/order'
import { NextResponse } from 'next/server'
export async function POST(req){
    try {
        const items = await req.json();
        console.log(items);
        const result = await deliverOrder(items);
        return NextResponse.json({result}, {status:200});   
    } catch (error) {
        console.log(error)
        return NextResponse.json({error: error.messages}, {status: 500});
    }   
}