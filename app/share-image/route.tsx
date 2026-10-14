/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
export const runtime = "nodejs";
export const dynamic = "force-static";

// Self-hosted PNG; use existing FindMyDup illustrations, no third-party requests.
export async function GET() {
  const [sage,tan]=await Promise.all([
    readFile(join(process.cwd(),"public/products/bag.svg"),"base64"),
    readFile(join(process.cwd(),"public/products/bag-tan.svg"),"base64"),
  ]);
  const base={display:"flex"} as const;
  return new ImageResponse(
    <div style={{...base,width:"100%",height:"100%",position:"relative",overflow:"hidden",backgroundColor:"#f7f8f2",color:"#253831",fontFamily:"Arial,sans-serif"}}>
      <div style={{...base,position:"absolute",top:50,left:62,alignItems:"center"}}>
        <div style={{...base,width:58,height:58,borderRadius:17,backgroundColor:"#29734f",alignItems:"center",justifyContent:"center",position:"relative"}}>
          <div style={{fontSize:49,fontWeight:800,color:"#fff",marginTop:5}}>f</div>
          <div style={{position:"absolute",top:-5,right:3,color:"#d6f39b",fontSize:27}}>↗</div>
        </div>
        <div style={{...base,marginLeft:15,fontSize:38,fontWeight:800,letterSpacing:-1.8}}>findmydup<span style={{color:"#29734f"}}>.</span></div>
      </div>
      <div style={{...base,position:"absolute",top:175,left:62,width:660,flexDirection:"column"}}>
        <div style={{...base,fontWeight:700,fontSize:18,letterSpacing:1.8,color:"#29734f"}}>PRODUKTE SUCHEN. BESSER ENTSCHEIDEN.</div>
        <div style={{...base,flexDirection:"column",fontWeight:800,fontSize:60,lineHeight:1.13,letterSpacing:-2.5,marginTop:25}}>
          <span>Finde Produkte.</span>
          <span style={{color:"#29734f"}}>Vergleiche Preise.</span>
        </div>
        <div style={{...base,flexDirection:"column",fontSize:27,lineHeight:1.35,color:"#65736c",marginTop:26}}>
          <span>Echte Angebote entdecken.</span>
          <span>Bewusst einkaufen.</span>
        </div>
      </div>
      <div style={{...base,position:"absolute",bottom:42,left:62,padding:"11px 21px",borderRadius:25,backgroundColor:"#e5eddd",color:"#29734f",fontWeight:700,fontSize:19}}>findmydup.de</div>
      <div style={{...base,position:"absolute",top:80,right:-100,width:560,height:560,borderRadius:280,backgroundColor:"#d6f39b",opacity:.7}}/>
      <div style={{...base,position:"absolute",right:60,top:139,width:250,height:280,backgroundColor:"#fff",borderRadius:24,flexDirection:"column",alignItems:"center",padding:13,transform:"rotate(9deg)",boxShadow:"0 18px 30px #25383120"}}>
        <div style={{...base,color:"#65736c",fontWeight:700,fontSize:14,letterSpacing:1}}>PRODUKT ENTDECKEN</div>
        <img src={"data:image/svg+xml;base64,"+sage} alt="" width={222} height={222} style={{objectFit:"contain"}}/>
      </div>
      <div style={{...base,position:"absolute",right:232,top:266,width:241,height:266,backgroundColor:"#fff",borderRadius:24,flexDirection:"column",alignItems:"center",padding:12,transform:"rotate(-8deg)",boxShadow:"0 18px 32px #25383125"}}>
        <div style={{...base,color:"#65736c",fontWeight:700,fontSize:14,letterSpacing:1}}>ALTERNATIVEN FINDEN</div>
        <img src={"data:image/svg+xml;base64,"+tan} alt="" width={216} height={216} style={{objectFit:"contain"}}/>
      </div>
      <div style={{...base,position:"absolute",bottom:56,right:42,padding:"14px 19px",backgroundColor:"#29734f",borderRadius:17,color:"#fff",fontSize:23,fontWeight:700}}>Suchen → Vergleichen</div>
    </div>,
    {width:1200,height:630}
  );
}
