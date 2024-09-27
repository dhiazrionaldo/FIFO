import {getAllLounge} from '@/lib/db/lounge/lounge'
import { NextResponse } from 'next/server'
export async function GET(req){
    try {
        const items = await getAllLounge();
        return NextResponse.json({items}, {status:200});   
    } catch (error) {
        console.log(error)
        return NextResponse.json({error: error.messages}, {status: 500});
    }   
}