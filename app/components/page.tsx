import type { Metadata } from "next";
import { getAllComponents } from "@/lib/registry";
import { ComponentsGallery } from "@/components/components-gallery";

export const metadata: Metadata = {
  title: "Components",
  description:
    "Browse copy-paste React and Next.js components built with Tailwind CSS and Motion.",
  alternates: {
    canonical: "/components/",
  },
};

export default function ComponentsListPage() {
  const components = getAllComponents();

  return <ComponentsGallery components={components} />;
}
