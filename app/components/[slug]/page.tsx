import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllComponents, getComponentBySlug } from "@/lib/registry";
import { ComponentViewer } from "@/components/component-viewer";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const component = getComponentBySlug(slug);
  if (!component) return {};

  return {
    title: component.title,
    description: component.description,
    alternates: {
      canonical: `/components/${slug}/`,
    },
    openGraph: {
      title: `${component.title} | up2px UI`,
      description: component.description,
    },
    twitter: {
      title: `${component.title} | up2px UI`,
      description: component.description,
    },
  };
}

export async function generateStaticParams() {
  const components = getAllComponents();
  return components.map((comp) => ({
    slug: comp.slug,
  }));
}

export default async function ComponentPage({ params }: PageProps) {
  const { slug } = await params;
  const component = getComponentBySlug(slug);

  if (!component) {
    notFound();
  }

  return <ComponentViewer component={component} />;
}
