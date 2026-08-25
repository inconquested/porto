// Maps each tech (exactly as written in messages/*.json — identical across all
// locales) to a verified brand SVG under /public/logos.
//
// Sources (self-hosted, no runtime third-party requests):
//   • svgl.app        — full-colour brand marks (MIT; trademarks belong to owners)
//   • simple-icons    — CC0 icon set, brand-hex tinted (marks trademarked by owners)
//
// `themed: true` means two files exist — `${slug}-light.svg` (dark ink, shown in
// light mode) and `${slug}-dark.svg` (light ink, shown in dark mode) — because the
// mark is otherwise near-invisible against one of the two canvases. The rest are a
// single `${slug}.svg` that reads on both.
export type TechLogo = { slug: string; themed?: boolean };

export const TECH_LOGOS: Record<string, TechLogo> = {
  // Frontend & UI
  "Next.js": { slug: "nextjs", themed: true },
  "React.js": { slug: "react", themed: true },
  "Laravel Blade": { slug: "laravel" },
  Livewire: { slug: "livewire" },
  "Tailwind CSS": { slug: "tailwindcss" },
  "HTML5 / CSS3": { slug: "html5" },
  "React Three Fiber": { slug: "threejs", themed: true },
  "Framer Motion": { slug: "framer", themed: true },

  // Backend & API
  Laravel: { slug: "laravel" },
  "Node.js": { slug: "nodejs" },
  "Express.js": { slug: "expressjs", themed: true },
  "Hono.js": { slug: "hono" },
  FastAPI: { slug: "fastapi" },
  PHP: { slug: "php", themed: true },

  // Mobile
  Flutter: { slug: "flutter" },
  Kotlin: { slug: "kotlin" },
  Java: { slug: "java" },
  Firebase: { slug: "firebase" },

  // Desktop & cross-platform
  "Kotlin Multiplatform": { slug: "kotlin" },
  ".NET MAUI": { slug: "dotnet" },
  ".NET WPF": { slug: "dotnet" },
  ".NET WinForms": { slug: "dotnet" },
  Swing: { slug: "java" },

  // Database & storage
  MySQL: { slug: "mysql", themed: true },
  PostgreSQL: { slug: "postgresql" },
  SQLite: { slug: "sqlite" },
  "Firebase Firestore": { slug: "firebase" },
  Supabase: { slug: "supabase" },

  // ORM & database tools
  "Prisma ORM": { slug: "prisma", themed: true },

  // AI & machine learning
  Python: { slug: "python" },
  "Scikit-learn": { slug: "scikitlearn" },
  "Jupyter Notebook": { slug: "jupyter" },
  Numpy: { slug: "numpy", themed: true },
  Pandas: { slug: "pandas", themed: true },
  "Google Cloud AI": { slug: "googlecloud" },
  "Anthropic AI SDK": { slug: "anthropic", themed: true },
  "Mistral AI": { slug: "mistralai" },
  "Google Cloud Vertex AI": { slug: "googlecloud" },
  "Vercel AI SDK": { slug: "vercel", themed: true },

  // Cloud & infrastructure
  AWS: { slug: "aws", themed: true },
  Cloudflare: { slug: "cloudflare" },
  Vercel: { slug: "vercel", themed: true },

  // Development tools
  Ngrok: { slug: "ngrok", themed: true },
  Git: { slug: "git" },
  "Github Actions": { slug: "githubactions" },

  // Testing
  Playwright: { slug: "playwright" },
  Puppeteer: { slug: "puppeteer" },
};
