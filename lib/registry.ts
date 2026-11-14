import registryManifest from "@/registry/__generated__/registry-manifest.json";

export interface RegistryFile {
  relativePath: string;
  content: string;
  highlightedHtml: string;
}

export interface RegistryComponentMeta {
  slug: string;
  title: string;
  tagline?: string;
  description: string;
  dependencies: string[];
  registryDependencies: string[];
  files: RegistryFile[];
  hasDemo: boolean;
  demoContent: string;
  demoHighlightedHtml: string;
  installCommand: string;
}

export function getAllComponents(): RegistryComponentMeta[] {
  return Object.values(
    registryManifest as Record<string, RegistryComponentMeta>,
  );
}

export function getComponentBySlug(slug: string): RegistryComponentMeta | null {
  const manifest = registryManifest as Record<string, RegistryComponentMeta>;
  return manifest[slug] || null;
}
