import { getAllOrder } from '@/lib/db/order/order';
import { NextResponse } from 'next/server';

export const maxDuration = 60;
export const fetchCache = 'force-no-store';
export const revalidate=0

export async function GET(req) {
    try {
        const items = await getAllOrder();
        return NextResponse.json(
            { items }, 
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
        console.log(error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
