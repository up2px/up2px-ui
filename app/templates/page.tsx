import type { Metadata } from "next";
import { ComingSoon } from "@/components/landing/coming-soon";

export const metadata: Metadata = {
  title: "Templates",
  description: "Full-page Next.js and Tailwind CSS templates, coming soon.",
  alternates: {
    canonical: "/templates/",
  },
};

export default function TemplatesPage() {
  return <ComingSoon />;
}
