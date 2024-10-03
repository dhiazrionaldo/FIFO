import {getLoungeOrder, createLoungeOrder, editStockIn, deleteLoungeOrder, editStockOut} from '@/lib/db/order/order'
import { NextResponse } from 'next/server'

export const maxDuration = 60;
export const fetchCache = 'force-no-store';
export const revalidate=0

export async function GET(req){
    try {
        const { searchParams } = new URL(req.url);
        const from = searchParams.get('from');
        const to = searchParams.get('to');
    
        if (!from || !to) {
          return NextResponse.json({ error: 'Invalid date range' }, { status: 400 });
        }
        const items = await getLoungeOrder({from, to});
        return NextResponse.json(
            {items}, 
            {status:200}, 
            {
                status: 200,
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                    'Expires': '0',
                    'Pragma': 'no-cache'
                }
            }
        );   
    } catch (error) {
        console.log(error)
        return NextResponse.json({error: error.messages}, {status: 500});
    }   
}

export async function POST(req){
    try {
        const items = await req.json();
        const result = await createLoungeOrder(items);
        return NextResponse.json({result}, {status: 200})
    } catch (error) {
        console.log(error)
        return NextResponse.json({error: error.messages}, {status: 500});
    }
}

export async function PUT(req){
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    
    try {
        const items = await req.json();
        const result = await editStockOut(id, items);
        return NextResponse.json({result}, {status: 200});
    } catch (error) {
        console.log(error)
        return NextResponse.json({error: error.messages}, {status: 500});
    }
}


export async function DELETE(req){
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    
    try {
        const result = await deleteLoungeOrder(id);
        return NextResponse.json({result}, {status:200});    
    } catch (error) {
        return NextResponse.json({error: error.messages}, {status: 500});
    }
}