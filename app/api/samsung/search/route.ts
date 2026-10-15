import {NextRequest,NextResponse} from "next/server";
import {samsungCatalogEnabled,sanitizeSamsungQuery,searchSamsungProducts} from "@/lib/samsung-catalog";
export const dynamic="force-dynamic";
export async function GET(request:NextRequest){
  if(!samsungCatalogEnabled())return NextResponse.json({error:"Not found"},{status:404});
  const q=sanitizeSamsungQuery(request.nextUrl.searchParams.get("q")||"");
  if(q.length<2)return NextResponse.json({products:[],total:0},{headers:{"Cache-Control":"no-store"}});
  try{
    const {products,total}=await searchSamsungProducts({q,page:1,pageSize:8});
    return NextResponse.json({products,total},{headers:{"Cache-Control":"no-store"}});
  }catch{return NextResponse.json({error:"Temporarily unavailable"},{status:503,headers:{"Cache-Control":"no-store"}});}
}
