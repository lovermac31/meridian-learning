import "../globals.css";
import { RootShell, rootMetadata } from "@/components/RootShell";

// Root layout for the English pages: the shared shell with lang="en".
export const metadata = rootMetadata;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <RootShell lang="en">{children}</RootShell>;
}
