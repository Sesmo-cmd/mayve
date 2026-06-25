import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tag, Package, ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/admin/categories")({ component: CategoriesPage });

type Product = { id: string; name: string; category: string; stock: number; available: boolean; images: string[] };

function CategoriesPage() {
  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
      return (data ?? []) as Product[];
    },
  });

  const grouped = products.reduce<Record<string, Product[]>>((acc, p) => {
    const k = p.category?.trim() || "Uncategorized";
    (acc[k] ||= []).push(p);
    return acc;
  }, {});
  const entries = Object.entries(grouped).sort((a, b) => b[1].length - a[1].length);

  return (
    <div>
      <div className="bg-white border border-neutral-200 rounded-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100">
          <div>
            <h2 className="text-[15px] font-semibold text-neutral-900">Categories</h2>
            <p className="text-xs text-neutral-500 mt-0.5">Categories are derived from your product catalog.</p>
          </div>
          <Link to="/admin/products" className="text-[13px] font-medium text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1">
            Manage products <ArrowUpRight size={13} />
          </Link>
        </div>

        {entries.length === 0 ? (
          <div className="p-20 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-neutral-100">
              <Tag size={18} className="text-neutral-400" />
            </div>
            <p className="mt-3 text-sm text-neutral-700">No categories yet</p>
            <p className="mt-1 text-xs text-neutral-500">Assign a category when creating a product.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {entries.map(([cat, items]) => {
              const inStock = items.filter((i) => i.available && i.stock > 0).length;
              return (
                <div key={cat} className="rounded-xl border border-neutral-200 p-5 hover:border-indigo-300 transition">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 rounded-lg bg-indigo-50 text-indigo-600 grid place-items-center">
                        <Tag size={15} />
                      </div>
                      <div>
                        <div className="font-medium text-neutral-900">{cat}</div>
                        <div className="text-[11px] text-neutral-500">{items.length} products · {inStock} active</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex -space-x-2">
                    {items.slice(0, 4).map((p) =>
                      p.images[0] ? (
                        <img key={p.id} src={p.images[0]} alt={p.name} className="h-9 w-9 rounded-md object-cover ring-2 ring-white" />
                      ) : (
                        <div key={p.id} className="h-9 w-9 rounded-md bg-neutral-100 grid place-items-center ring-2 ring-white">
                          <Package size={12} className="text-neutral-400" />
                        </div>
                      )
                    )}
                    {items.length > 4 && (
                      <div className="h-9 w-9 rounded-md bg-neutral-100 grid place-items-center ring-2 ring-white text-[11px] font-medium text-neutral-600">
                        +{items.length - 4}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
