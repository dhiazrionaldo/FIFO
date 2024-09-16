import {getStorage, createStorage, editStorage, deleteStorage} from '@/lib/db/storage/storage'
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
            const items = await getStorage({from, to});
            return NextResponse.json({items}, {status:200});   
        } catch (error) {
            console.log(error)
            return NextResponse.json({error: error.messages}, {status: 500});
        }   
    }

export async function POST(req){
    try {
        const items = await req.json();
        const result = await createStorage(items);
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
        console.log(items)
        const result = await editStorage(id, items);
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
        const result = await deleteStorage(id);
        return NextResponse.json({result}, {status:200});    
    } catch (error) {
        return NextResponse.json({error: error.messages}, {status: 500});
    }
}