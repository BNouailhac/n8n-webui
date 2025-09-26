# 1. Use Node.js LTS as base image
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# 2. Install dependencies only when needed
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci

# 3. Build the app
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# 4. Production image, copy built app
FROM base AS runner
ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nextjs \
  && adduser --system --uid 1001 nextjs

WORKDIR /app

# Copy only necessary files
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules

USER nextjs

EXPOSE 3000
CMD ["npm", "start"]
