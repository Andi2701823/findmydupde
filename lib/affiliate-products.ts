/* Product data imported from Awin Publisher 3123004 / bdr-beauty DE 125128.
   Source: feed 116166 (Default), 63 unique merchant product IDs.
   Awin index reports last imported 2026-06-25. The other feed (115998) has duplicates
   and a conflicting price for merchant product 1815; never merge those prices.
   Affiliate URLs are reconstructed only from validated exact Awin links in this file.
   Do not add products from non-joined merchants or invent live prices/availability. */
export type AffiliateCategory = "Gesichtspflege" | "Masken & Peelings" | "Sets & Kuren" | "Sonnenschutz";
export type AffiliateProduct = { id:string; name:string; category:AffiliateCategory; priceCents:number; image:string; affiliateUrl:string; merchant:string };
export const affiliateFeedImported = "25.06.2026";
type Raw = [string,string,string,number,string,AffiliateCategory];
const rows:Raw[] = [
["1815","45133289526","Elysium Skin Set",36000,"/wp-content/uploads/2026/02/Elysium_Mood.jpg","Sets & Kuren"],
["1352","45133289527","DermaLumin-C Melanin Correcting Serum",3950,"/wp-content/uploads/2026/01/116583_DermaLumin-C.png","Gesichtspflege"],
["276","45133289528","Bota NT Peptide Relaxing Complex",3950,"/wp-content/uploads/2025/11/bdr-BotaNotox-7er6KJ2kKjMUzHOJ.png","Gesichtspflege"],
["269","45133289529","Bio Cell Mask skin perfecting",1070,"/wp-content/uploads/2025/11/130045_BioCell_mockup_small1.png","Masken & Peelings"],
["267","45133289530","Laser Effect Mask peptide complex face mask",1600,"/wp-content/uploads/2025/11/130050_Laser-Effect-Mask_frei_neu.png","Masken & Peelings"],
["264","45133289531","Stretch Lift Mask hydrating & regenerating",1070,"/wp-content/uploads/2025/11/130040_stretch_lift_mockup_small1.jpg","Masken & Peelings"],
["262","45133289532","Diamond Stick",6900,"/wp-content/uploads/2025/11/151070_bdr_diamondstick.png","Gesichtspflege"],
["258","45133289533","4 Wochen Kur - NEURO RESCUE",13200,"/wp-content/uploads/2025/11/neuro-rescue.png","Sets & Kuren"],
["252","45133289534","4 Wochen Kur - YOUTH ESSENTIALS",12200,"/wp-content/uploads/2025/11/youthessentials-1.png","Sets & Kuren"],
["250","45133289535","4 Wochen Kur - REJUVENATION",12200,"/wp-content/uploads/2025/11/Rejuvenation1.png","Sets & Kuren"],
["247","45133289536","4 Wochen Kur - PURIFICATION",13200,"/wp-content/uploads/2025/11/purification1.png","Sets & Kuren"],
["244","45133289537","4 Wochen Kur - BRIGHTENING",13200,"/wp-content/uploads/2025/11/Brightening1.png","Sets & Kuren"],
["242","45133289538","Re-flect² Sonnenfluid - Stem Cell Defense 50 ml",4950,"/wp-content/uploads/2025/11/116830_Re-flect2_50ml_VK_WEB.png","Sonnenschutz"],
["241","45133289539","Re-flect² Sonnenfluid - Stem Cell Defense 15 ml",1570,"/wp-content/uploads/2025/11/116830-T_Re-flect2_15ml_RG-web.png","Sonnenschutz"],
["237","45133289540","Re-set 4D eye serum",4450,"/wp-content/uploads/2025/11/116801_Re-set-4D_box_tube_15ml_VK.png","Gesichtspflege"],
["235","45133289541","Re-construct nourishing cream complex 50 ml",13200,"/wp-content/uploads/2025/11/116651_Re-construct_box_jar_50ml_VK.png","Gesichtspflege"],
["234","45133289542","Re-construct nourishing cream complex 15 ml",3990,"/wp-content/uploads/2025/11/B116651-T_Re-construct_box_jar_15ml_RG.png","Gesichtspflege"],
["230","45133289543","Re-vital EP even & perfect brightening cream 50 ml",10500,"/wp-content/uploads/2025/11/116460_Re-vital-EP_box_bottle_50ml_VK.png","Gesichtspflege"],
["229","45133289544","Re-vital EP even & perfect brightening cream 15 ml",3450,"/wp-content/uploads/2025/11/116460-T_Re-vital-EP_box_bottle_15ml_RG.png","Gesichtspflege"],
["225","45133289545","Re-vital PH pure harmony peptides cream 50 ml",9900,"/wp-content/uploads/2025/11/116750_Re-vital-PH_box_bottle_50ml_VK.png","Gesichtspflege"],
["224","45133289546","Re-vital PH pure harmony peptides cream 15 ml",3240,"/wp-content/uploads/2025/11/116750-T_Re-vital-PH_box_bottle_15ml_RG.png","Gesichtspflege"],
["219","45133289547","Re-vital essential peptides cream with OPC 50 ml",9600,"/wp-content/uploads/2025/11/116700_Re-vital_box_bottle_50ml_VK.png","Gesichtspflege"],
["218","45133289548","Re-vital essential peptides cream with OPC 15 ml",2970,"/wp-content/uploads/2025/11/116700-T_Re-vital_box_bottle_15ml_RG.png","Gesichtspflege"],
["212","45133289549","Contour neck defining serum with Edelweiss extract 30 ml",6250,"/wp-content/uploads/2025/11/116440_Contour_Neck_Serum_30ml_VK1-scaled.png","Gesichtspflege"],
["211","45133289550","Contour neck defining serum with Edelweiss extract 10 ml",2075,"/wp-content/uploads/2025/11/116440-T_Contour-neck_box_bottle_10ml_RG.png","Gesichtspflege"],
["207","45133289551","Brilliant EP even & perfect brightening serum with vitamin C 30 ml",10500,"/wp-content/uploads/2025/11/116470_Brilliant-EP_box_bottle_30ml_VK.png","Gesichtspflege"],
["206","45133289552","Brilliant EP even & perfect brightening serum with vitamin C 10 ml",3850,"/wp-content/uploads/2025/11/116470-T_Brilliant-EP_box_bottle_10ml_RG.png","Gesichtspflege"],
["202","45133289553","Re-fine structuring serum 30 ml",8900,"/wp-content/uploads/2025/11/116860_Re-fine_box_bottle_30ml_VK.png","Gesichtspflege"],
["201","45133289554","Re-fine structuring serum 10 ml",3200,"/wp-content/uploads/2025/11/116860-T_Re-fine_box_bottle_10ml_RG.png","Gesichtspflege"],
["197","45133289555","Re-lax 3 multifunctional serum with peptide complex 30 ml",11100,"/wp-content/uploads/2025/11/116620_Re-lax-3_box_bottle_30ml_VK.png","Gesichtspflege"],
["196","45133289556","Re-lax 3 multifunctional serum with peptide complex 10 ml",3700,"/wp-content/uploads/2025/11/116620-T_Re-lax3_box_bottle_10ml_RG.png","Gesichtspflege"],
["193","45133289557","Stem Cell BOOSTER + Growth Factors",3950,"/wp-content/uploads/2025/11/bdr-StemCell-7erSIctEntskMGgM.png","Gesichtspflege"],
["191","45133289558","Rosa CALM Capillary Relief",3950,"/wp-content/uploads/2025/11/bdr-RosaCalm-7ertdET24NgBbcFl.png","Gesichtspflege"],
["188","45133289559","SOS Boswellia Skin Defense Booster",4950,"/wp-content/uploads/2025/11/DSC_7550-Kopie.jpg","Gesichtspflege"],
["184","45133289560","Hyaluron ULTRA",3450,"/wp-content/uploads/2025/11/bdr-HyaluronUltra-7erpTUSdc15mEuO7.png","Gesichtspflege"],
["180","45133289561","Re-charge sun hyaluronic acid UV protection serum 30 ml",7950,"/wp-content/uploads/2025/11/116560_Re-charge-sun_box_bottle_30ml_VK.png","Sonnenschutz"],
["179","45133289562","Re-charge sun hyaluronic acid UV protection serum 10 ml",3100,"/wp-content/uploads/2025/11/116560-T_Re-charge-sun_box_bottle_10ml_RG.png","Sonnenschutz"],
["174","45133289563","Re-charge N hyaluronic acid regenerating serum 30 ml",9800,"/wp-content/uploads/2025/11/116550_Re-charge-N_box_bottle_30ml_VK.png","Gesichtspflege"],
["173","45133289564","Re-charge N hyaluronic acid regenerating serum 10 ml",3200,"/wp-content/uploads/2025/11/116550-T_Re-charge-N_box_bottle_10ml_RG.png","Gesichtspflege"],
["168","45133289565","Re-charge PH hyaluronic acid pure harmony serum 30 ml",6150,"/wp-content/uploads/2025/11/116540_Re-charge-PH_box_bottle_30ml_VK.png","Gesichtspflege"],
["167","45133289566","Re-charge PH hyaluronic acid pure harmony serum 10 ml",2850,"/wp-content/uploads/2025/11/116540-T_Re-charge-PH_box_bottle_10ml_RG.png","Gesichtspflege"],
["163","45133289567","Re-charge hyaluronic acid intense serum 50 ml",9450,"/wp-content/uploads/2025/11/116500_Re-charge_box_bottle_50ml_VK.png","Gesichtspflege"],
["162","45133289568","Re-charge hyaluronic acid intense serum 10 ml",2150,"/wp-content/uploads/2025/11/116500-T_Re-charge_box_bottle_10ml_RG.png","Gesichtspflege"],
["157","45133289569","Re-action E enzymatic & mechanical peeling 1x 0,4 g",890,"/wp-content/uploads/2025/11/114400-1-Reaction-E_1er_-box-scaled.jpg","Masken & Peelings"],
["156","45133289570","Re-action E enzymatic & mechanical peeling 12x 0,4 g",8900,"/wp-content/uploads/2025/11/114400-12-Re-action-E-12er_small.jpg","Masken & Peelings"],
["152","45133289571","Re-action EP tranexamic acid even & perfect brightening essence 30 ml",6900,"/wp-content/uploads/2025/11/116230_Re-action-EP_box_bottle_30ml_VK.png","Gesichtspflege"],
["151","45133289572","Re-action EP tranexamic acid even & perfect brightening essence 10 ml",2750,"/wp-content/uploads/2025/11/116230-T_Re-action-EP_box_bottle_10ml_RG.png","Gesichtspflege"],
["143","45133289573","Re-action control PHA gluconic acid exfoliation essence 30 ml",6900,"/wp-content/uploads/2025/11/114210_Re-action-PH_box_bottle_30ml_VK-1.png","Masken & Peelings"],
["142","45133289574","Re-action control PHA gluconic acid exfoliation essence 10 ml",2750,"/wp-content/uploads/2025/11/114220-T_Re-action-control_box_bottle_10ml_RG.png","Masken & Peelings"],
["137","45133289575","Re-action PH AHA mandelic & succinic acid exfoliation essence 30 ml",6900,"/wp-content/uploads/2025/11/114210_Re-action-PH_box_bottle_30ml_VK.png","Masken & Peelings"],
["136","45133289576","Re-action PH AHA mandelic & succinic acid exfoliation essence 10 ml",2750,"/wp-content/uploads/2025/11/114210-T_Re-action-PH_box_bottle_10ml_RG.png","Masken & Peelings"],
["131","45133289577","Re-action deep low base AHA glycolic acid exfoliation essence 30 ml",6900,"/wp-content/uploads/2025/10/114350_Re-action-deep_box_bottle_30ml_VK.png","Masken & Peelings"],
["130","45133289578","Re-action deep low base AHA glycolic acid exfoliation essence 10 ml",2750,"/wp-content/uploads/2025/10/114350-T_Re-action-deep_box_bottle_10ml_RG.png","Masken & Peelings"],
["126","45133289579","Re-action natural low base AHA citric & lactic acid exfoliation essence 30 ml",6900,"/wp-content/uploads/2025/10/114200_Re-action-natural_box_bottle_30ml_VK.png","Masken & Peelings"],
["125","45133289580","Re-action natural low base AHA citric & lactic acid exfoliation essence 10 ml",2750,"/wp-content/uploads/2025/10/114200-T_Re-action-natural_box_bottle_10ml_RG.png","Masken & Peelings"],
["121","45133289581","Re-action Tonic Professional skin preparation essence with BHA & Phytocomplex 30 ml",2075,"/wp-content/uploads/2025/10/B114190-15TB_box-Re-action-tonic-30ml-RG_small.png","Gesichtspflege"],
["120","45133289582","Re-action Tonic Professional skin preparation essence with BHA & Phytocomplex 150 ml",6900,"/wp-content/uploads/2025/10/114192_Re-action-tonic_box_bottle_150ml_VK.png","Gesichtspflege"],
["116","45133289583","Re-move PH cleansing mask with microsilver 30 ml",2250,"/wp-content/uploads/2025/10/116070-T_Re-move-PH_box_bottle_30ml_RG.png","Masken & Peelings"],
["115","45133289584","Re-move PH cleansing mask with microsilver 100 ml",6750,"/wp-content/uploads/2025/10/116070_Re-movePH_box_bottle_100ml_VK.png","Masken & Peelings"],
["110","45133289585","Deep Cleanse hydrating skin cleansing foam with NMF 30 ml",1450,"/wp-content/uploads/2025/10/B116060-15TB_box_Deep-Cleanse_RG_30ml_small.png","Gesichtspflege"],
["109","45133289586","Deep Cleanse hydrating skin cleansing foam with NMF 100 ml",3950,"/wp-content/uploads/2025/10/116060_Deep-cleanse_box_bottle_100ml_VK.png","Gesichtspflege"],
["102","45133289587","Re-move cleanser with aloe vera 30ml",1265,"/wp-content/uploads/2025/10/116050-T_Re-move_box_bottle_30ml_RG.png","Gesichtspflege"],
["101","45133289588","Re-move cleanser with aloe vera 100ml",4150,"/wp-content/uploads/2025/10/116050_Re-move_box_bottle_100ml_VK.png","Gesichtspflege"]
];
export const affiliateProducts:AffiliateProduct[] = rows.map(([id,awinProductId,name,priceCents,imagePath,category])=>({
  id,name,priceCents,category,
  image:`https://bdr-beauty.com${imagePath}`,
  affiliateUrl:`https://www.awin1.com/pclick.php?p=${awinProductId}&a=3123004&m=125128`,
  merchant:"bdr-beauty DE",
}));
export function formatFeedPrice(priceCents:number):string{
  return new Intl.NumberFormat("de-DE",{style:"currency",currency:"EUR"}).format(priceCents/100);
}
export function findAffiliateProducts(query:string,category?:string):AffiliateProduct[]{
  const terms=query.toLocaleLowerCase("de").trim().split(/\s+/).filter(Boolean);
  return affiliateProducts.filter(p=>(!category||p.category===category)&&terms.every(t=>`${p.name} ${p.category}`.toLocaleLowerCase("de").includes(t)));
}
