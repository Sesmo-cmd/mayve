import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useSiteContent(defaults: Record<string, string>) {
  const { data } = useQuery({
    queryKey: ["site_content"],
    queryFn: async () => {
      const { data } = await supabase.from("site_content").select("key,value");
      const map: Record<string, string> = {};
      (data ?? []).forEach((r: any) => { map[r.key] = r.value ?? ""; });
      return map;
    },
    staleTime: 30_000,
  });
  return (key: string) => (data?.[key] ?? defaults[key] ?? "");
}

export function HtmlText({ html, as: Tag = "span", ...rest }: { html: string; as?: any; className?: string; style?: React.CSSProperties }) {
  return <Tag {...rest} dangerouslySetInnerHTML={{ __html: html }} />;
}
