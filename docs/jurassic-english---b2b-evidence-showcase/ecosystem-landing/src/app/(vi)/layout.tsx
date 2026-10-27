import "../globals.css";
import { RootShell, rootMetadata } from "@/components/RootShell";

// Root layout for the Vietnamese pages (/vi/...): the shared shell with lang="vi".
export const metadata = rootMetadata;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <RootShell lang="vi">{children}</RootShell>;
}
