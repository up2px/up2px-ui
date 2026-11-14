import type { Metadata } from "next";
import { ComingSoon } from "@/components/landing/coming-soon";

export const metadata: Metadata = {
  title: "Blocks",
  description: "Pre-built UI blocks for React and Next.js, coming soon.",
  alternates: {
    canonical: "/blocks/",
  },
};

export default function BlocksPage() {
  return <ComingSoon />;
}
