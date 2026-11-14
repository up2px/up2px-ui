import fs from "node:fs";
import path from "node:path";
import { createHighlighter } from "shiki";

interface RegistryMeta {
  title?: string;
  tagline?: string;
  description?: string;
  dependencies?: string[];
  registryDependencies?: string[];
}

interface ComponentFile {
  relativePath: string;
  content: string;
}

interface RegistryIndexItem {
  name: string;
  title: string;
  description: string;
  type: "registry:ui";
  dependencies: string[];
  registryDependencies: string[];
  files: string[];
}

interface RegistryManifestEntry {
  slug: string;
  title: string;
  tagline?: string;
  description: string;
  dependencies: string[];
  registryDependencies: string[];
  files: Array<ComponentFile & { highlightedHtml: string }>;
  hasDemo: boolean;
  demoContent: string;
  demoHighlightedHtml: string;
  installCommand: string;
}

const ROOT = process.cwd();
const COMPONENTS_DIR = path.join(ROOT, "registry", "components");
const DEMOS_DIR = path.join(ROOT, "registry", "demos");
const PUBLIC_R_DIR = path.join(ROOT, "public", "r");
const GENERATED_DIR = path.join(ROOT, "registry", "__generated__");

function extractImports(code: string): string[] {
  const deps = new Set<string>();
  const importRegex = /(?:import|from)\s+['"]([^'"]+)['"]/g;
  let match;
  while ((match = importRegex.exec(code)) !== null) {
    const pkg = match[1];
    if (!pkg.startsWith(".") && !pkg.startsWith("@/") && !pkg.startsWith("/")) {
      const parts = pkg.split("/");
      const rootPkg = pkg.startsWith("@")
        ? `${parts[0]}/${parts[1]}`
        : parts[0];
      if (rootPkg !== "react" && rootPkg !== "react-dom") {
        deps.add(rootPkg);
      }
    }
  }
  return Array.from(deps);
}

function getAllFiles(dir: string, baseDir: string = dir): ComponentFile[] {
  let results: ComponentFile[] = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(getAllFiles(fullPath, baseDir));
    } else if (
      /\.(tsx|ts|css)$/.test(entry.name) &&
      !entry.name.endsWith(".d.ts")
    ) {
      const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, "/");
      const content = fs.readFileSync(fullPath, "utf-8");
      results.push({ relativePath, content });
    }
  }
  return results;
}

async function main() {
  console.log("🔨 [Registry] Building component registry...");

  fs.mkdirSync(PUBLIC_R_DIR, { recursive: true });
  fs.mkdirSync(GENERATED_DIR, { recursive: true });

  const highlighter = await createHighlighter({
    themes: ["github-dark-default", "github-light-default"],
    langs: ["tsx", "typescript", "bash", "json"],
  });

  if (!fs.existsSync(COMPONENTS_DIR)) {
    fs.mkdirSync(COMPONENTS_DIR, { recursive: true });
  }
  if (!fs.existsSync(DEMOS_DIR)) {
    fs.mkdirSync(DEMOS_DIR, { recursive: true });
  }

  const componentDirs = fs
    .readdirSync(COMPONENTS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  const registryIndexItems: RegistryIndexItem[] = [];
  const manifestItems: Record<string, RegistryManifestEntry> = {};

  for (const slug of componentDirs) {
    const compDir = path.join(COMPONENTS_DIR, slug);
    const files = getAllFiles(compDir);

    if (files.length === 0) continue;

    let meta: RegistryMeta = {};
    const metaPath = path.join(compDir, "registry.meta.json");
    if (fs.existsSync(metaPath)) {
      try {
        meta = JSON.parse(fs.readFileSync(metaPath, "utf-8"));
      } catch (err) {
        console.warn(`Could not parse ${metaPath}:`, err);
      }
    }

    const title =
      meta.title ||
      slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    const description = meta.description || `${title} component for up2px-ui.`;

    // Auto extract dependencies from component files
    const autoDeps = new Set<string>(meta.dependencies || []);
    for (const f of files) {
      extractImports(f.content).forEach((d) => autoDeps.add(d));
    }

    const dependencies = Array.from(autoDeps);
    const registryDependencies = meta.registryDependencies || [];

    // Format shadcn-compatible files
    const registryFiles = files.map((f) => ({
      path: `ui/${slug}/${f.relativePath}`,
      content: f.content,
      type: "registry:ui",
      target: `components/ui/${slug}/${f.relativePath}`,
    }));

    const registryPayload = {
      $schema: "https://ui.shadcn.com/schema/registry-item.json",
      name: slug,
      type: "registry:ui",
      title,
      description,
      dependencies,
      registryDependencies,
      files: registryFiles,
    };

    // Write public/r/[slug].json
    const payloadPath = path.join(PUBLIC_R_DIR, `${slug}.json`);
    fs.writeFileSync(
      payloadPath,
      JSON.stringify(registryPayload, null, 2),
      "utf-8",
    );

    registryIndexItems.push({
      name: slug,
      title,
      description,
      type: "registry:ui",
      dependencies,
      registryDependencies,
      files: files.map((f) => f.relativePath),
    });

    // Check demo file
    const demoFileName = `${slug}-demo.tsx`;
    const demoFilePath = path.join(DEMOS_DIR, demoFileName);
    const hasDemo = fs.existsSync(demoFilePath);
    const demoContent = hasDemo ? fs.readFileSync(demoFilePath, "utf-8") : "";

    // Highlight files for pre-rendered docs
    const highlightedFiles: Record<string, string> = {};
    for (const f of files) {
      highlightedFiles[f.relativePath] = highlighter.codeToHtml(f.content, {
        lang: "tsx",
        themes: {
          dark: "github-dark-default",
          light: "github-light-default",
        },
      });
    }

    const highlightedDemo = hasDemo
      ? highlighter.codeToHtml(demoContent, {
          lang: "tsx",
          themes: {
            dark: "github-dark-default",
            light: "github-light-default",
          },
        })
      : "";

    manifestItems[slug] = {
      slug,
      title,
      ...(meta.tagline ? { tagline: meta.tagline } : {}),
      description,
      dependencies,
      registryDependencies,
      files: files.map((f) => ({
        relativePath: f.relativePath,
        content: f.content,
        highlightedHtml: highlightedFiles[f.relativePath],
      })),
      hasDemo,
      demoContent,
      demoHighlightedHtml: highlightedDemo,
      installCommand: `npx shadcn@latest add https://ui.up2px.com/r/${slug}.json`,
    };

    console.log(`  ✓ Built registry item: ${slug} (${files.length} files)`);
  }

  // Write public/r/index.json
  const indexPayload = {
    $schema: "https://ui.shadcn.com/schema/registry.json",
    name: "up2px-ui",
    homepage: "https://ui.up2px.com",
    items: registryIndexItems,
  };
  fs.writeFileSync(
    path.join(PUBLIC_R_DIR, "index.json"),
    JSON.stringify(indexPayload, null, 2),
    "utf-8",
  );

  // Write registry manifest for static pages
  fs.writeFileSync(
    path.join(GENERATED_DIR, "registry-manifest.json"),
    JSON.stringify(manifestItems, null, 2),
    "utf-8",
  );

  // Generate dynamic Demo component loader map
  const demoImports = componentDirs
    .filter((slug) => fs.existsSync(path.join(DEMOS_DIR, `${slug}-demo.tsx`)))
    .map((slug) => {
      const varName = slug.replace(/[^a-zA-Z0-9]/g, "_") + "Demo";
      return `import ${varName} from "@/registry/demos/${slug}-demo";`;
    })
    .join("\n");

  const demoMapEntries = componentDirs
    .filter((slug) => fs.existsSync(path.join(DEMOS_DIR, `${slug}-demo.tsx`)))
    .map((slug) => {
      const varName = slug.replace(/[^a-zA-Z0-9]/g, "_") + "Demo";
      return `  "${slug}": ${varName},`;
    })
    .join("\n");

  const demoMapSource = `// Auto-generated by scripts/build-registry.ts - DO NOT EDIT MANUALLY
import React from "react";
${demoImports}

export const DEMO_COMPONENTS: Record<string, React.ComponentType> = {
${demoMapEntries}
};

export function getDemoComponent(slug: string): React.ComponentType | null {
  return DEMO_COMPONENTS[slug] || null;
}
`;

  fs.writeFileSync(
    path.join(GENERATED_DIR, "demo-map.tsx"),
    demoMapSource,
    "utf-8",
  );

  console.log(
    `✅ [Registry] Successfully compiled ${componentDirs.length} components to /public/r & /registry/__generated__`,
  );
}

main().catch((err) => {
  console.error("❌ [Registry] Error building registry:", err);
  process.exit(1);
});
