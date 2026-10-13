import { handleProductSearch } from "@/server/http/product-search";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const GET = handleProductSearch;
