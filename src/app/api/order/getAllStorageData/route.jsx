import {getAllStorage} from '@/lib/db/storage/storage'
import { NextResponse } from 'next/server'
export async function GET(req){
    try {
        const items = await getAllStorage();
        return NextResponse.json({items}, {status:200});   
    } catch (error) {
        console.log(error)
        return NextResponse.json({error: error.messages}, {status: 500});
    }   
}