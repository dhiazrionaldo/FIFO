import {getHistory} from '@/lib/db/history/history' 
import { NextResponse } from 'next/server'

export const maxDuration = 60;

export async function GET(req){
    try {
        const { searchParams } = new URL(req.url);
        const from = searchParams.get('from');
        const to = searchParams.get('to');
    
        if (!from || !to) {
          return NextResponse.json({ error: 'Invalid date range' }, { status: 400 });
        }
        const items = await getHistory({from, to});
        return NextResponse.json({items}, {status:200});   
    } catch (error) {
        console.log(error)
        return NextResponse.json({error: error.message}, {status: 500});
    }   
}