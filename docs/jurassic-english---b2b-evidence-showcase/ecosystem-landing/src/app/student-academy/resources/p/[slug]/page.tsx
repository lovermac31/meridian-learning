import { ProductPage, productMetadata, productStaticParams } from "@/components/resources/pages";

export const dynamicParams = false;
export function generateStaticParams() {
  return productStaticParams();
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return productMetadata("en", (await params).slug);
}

export default async function ProductDetail({ params }: { params: Promise<{ slug: string }> }) {
  return <ProductPage lang="en" slug={(await params).slug} />;
}
