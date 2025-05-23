# LearningLab Cloudflare Pages Deployment

## 🌐 Live Application
**Production URL**: https://learninglab-nextjs.pages.dev

## 🚀 Deployment Process

### Prerequisites
1. Install Wrangler CLI: `npm install -g wrangler`
2. Login to Cloudflare: `wrangler login`

### Quick Deploy
```bash
./deploy.sh
```

### Manual Deployment Steps
1. **Build Next.js application:**
   ```bash
   npm run build
   ```

2. **Build for Cloudflare Pages:**
   ```bash
   npm run pages:build
   ```

3. **Deploy to Cloudflare Pages:**
   ```bash
   wrangler pages deploy .vercel/output/static --project-name learninglab-nextjs --branch main
   ```

## ⚙️ Configuration

### Environment Variables
Set these in the Cloudflare Pages dashboard:
- `OPENAI_API_KEY`: Your OpenAI API key for worksheet generation

### Key Files
- `wrangler.toml`: Cloudflare Pages configuration
- `next.config.ts`: Next.js configuration optimized for Cloudflare
- `src/app/api/generate-worksheet/route.ts`: API route with Edge Runtime

## 🔧 Technical Details

### Edge Runtime
The API routes are configured to use Edge Runtime for optimal performance on Cloudflare's global network:
```typescript
export const runtime = 'edge';
```

### Build Output
- Uses `@cloudflare/next-on-pages` adapter
- Outputs to `.vercel/output/static` directory
- Supports both static pages and Edge Functions

### Compatibility
- Node.js compatibility enabled via `nodejs_compat` flag
- Optimized for Cloudflare Workers environment
