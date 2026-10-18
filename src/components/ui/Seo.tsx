import { Helmet } from "react-helmet-async";
import { SITE } from "@/data/site";

interface SeoProps {
  title: string;
  description: string;
  /** Untuk halaman yang tidak boleh diindeks mesin pencari (mis. 404). */
  noIndex?: boolean;
}

/** Meta title/description dinamis per halaman (dibungkus <Helmet>). Perlu <HelmetProvider> di main.tsx. */
export default function Seo({ title, description, noIndex = false }: SeoProps) {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:locale" content="id_ID" />
      <meta property="og:site_name" content={SITE.name} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      {noIndex ? <meta name="robots" content="noindex" /> : null}
    </Helmet>
  );
}
