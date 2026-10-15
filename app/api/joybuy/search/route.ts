import {NextRequest,NextResponse} from "next/server";
import {joybuyCatalogEnabled,cleanJoybuySearch,searchJoybuyProducts} from "@/lib/joybuy-catalog";
export const dynamic="force-dynamic";
export async function GET(request:NextRequest){
  if(!joybuyCatalogEnabled())return NextResponse.json({error:"Not found"},{status:404,headers:{"Cache-Control":"no-store"}});
  const q=cleanJoybuySearch(request.nextUrl.searchParams.get("q")||"");
  if(q.length<2)return NextResponse.json({products:[],total:0},{headers:{"Cache-Control":"no-store"}});
  try{
    const {products,total}=await searchJoybuyProducts({q,pageSize:24,sort:"price-asc"});
    return NextResponse.json({products,total},{headers:{"Cache-Control":"no-store"}});
  }catch{return NextResponse.json({error:"Temporarily unavailable"},{status:503,headers:{"Cache-Control":"no-store"}});}
}
