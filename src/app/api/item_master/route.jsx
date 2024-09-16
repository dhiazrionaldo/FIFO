import {getItemMaster, createItemMaster, editItemMaster, deleteItemMaster} from '@/lib/db/item_master/item_master'
import { NextResponse } from 'next/server'

export const maxDuration = 60;

export async function GET(){
    try {
        const items = await getItemMaster();
        return NextResponse.json({items}, {status:200});   
    } catch (error) {
        return NextResponse.json({error: error.messages}, {status: 500});
    }   
}

export async function POST(req){
    try {
        const items = await req.json();
        const result = await createItemMaster(items);
        return NextResponse.json({result}, {status: 200})
    } catch (error) {
        return NextResponse.json({error: error.messages}, {status: 500});
    }
}

export async function PUT(req){
    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    try {
        const items = await req.json();
        const result = await editItemMaster(id, items);
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
        const result = await deleteItemMaster(id);
        return NextResponse.json({result}, {status:200});    
    } catch (error) {
        return NextResponse.json({error: error.messages}, {status: 500});
    }
}