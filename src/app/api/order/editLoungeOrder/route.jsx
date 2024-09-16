
export async function PUT(req){
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    
    try {
        const items = await req.json();
        const result = await editLoungeOrder(id, items);
        return NextResponse.json({result}, {status: 200});
    } catch (error) {
        console.log(error)
        return NextResponse.json({error: error.messages}, {status: 500});
    }
}