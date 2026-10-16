import { ProductPage, productMetadata, productStaticParams } from "@/components/resources/pages";

export const dynamicParams = false;
export function generateStaticParams() {
  return productStaticParams();
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return productMetadata("vi", (await params).slug);
}

export default async function ProductDetailVi({ params }: { params: Promise<{ slug: string }> }) {
  return <ProductPage lang="vi" slug={(await params).slug} />;
}
