import { CataloguePage, catalogueMetadata } from "@/components/resources/pages";

export const metadata = catalogueMetadata("en");

export default function ResourcesPage() {
  return <CataloguePage lang="en" />;
}
