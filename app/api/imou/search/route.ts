import {NextResponse} from "next/server";
import {imouOfferRows} from "@/lib/imou-products";
export const dynamic="force-dynamic";
export async function GET(req:Request){
 const search=new URL(req.url).searchParams;
 const q=(search.get("q")||"").replace(/[^\p{L}\p{N}\s_-]/gu," ").trim().slice(0,80);
 if(q.length<2)return NextResponse.json({source:"imou",products:[]},{headers:{"Cache-Control":"no-store"}});
 return NextResponse.json({source:"imou",products:imouOfferRows(q,24)},{
  headers:{"Cache-Control":"no-store"}
 });
}
