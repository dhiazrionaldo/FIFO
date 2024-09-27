import {getStorageExpenseOverview} from '@/lib/db/dashboard/dashboard' 
import { NextResponse } from 'next/server'

export const maxDuration = 60;

export async function GET(req){
    try {
        const items = await getStorageExpenseOverview();

        return NextResponse.json({items}, {status:200});   
    } catch (error) {
        console.log(error)
        return NextResponse.json({error: error.messages}, {status: 500});
    }   
}