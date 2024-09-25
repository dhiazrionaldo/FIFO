import {storageOpeningBalance} from '@/lib/db/storage/storage'
import { NextResponse } from 'next/server'

export const maxDuration = 60;

export async function PUT(req){
    try {
        const items = await req.json();
        const result = await storageOpeningBalance(items);
        return NextResponse.json({result}, {status: 200})
    } catch (error) {
        console.log(error)
        return NextResponse.json({error: error.messages}, {status: 500});
    }
}