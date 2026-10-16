/** Browser-safe formatting, no imported feed data in client-side product cards. */
export function euroImou(cents:number):string{
 return new Intl.NumberFormat("de-DE",{style:"currency",currency:"EUR"}).format(cents/100);
}
