import {getAllOrder} from '@/lib/db/order/order'
import { NextResponse } from 'next/server'
export async function GET(req){
    try {
        const items = await getAllOrder();
        return NextResponse.json({items}, {status:200, headers: { 'Cache-Control': 'public, s-maxage=1' }});   
    } catch (error) {
        console.log(error)
        return NextResponse.json({error: error.messages}, {status: 500});
    }   
}