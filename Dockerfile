# ----- Build Stage -----
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy all source files
COPY . .

# Build Next.js app
RUN npm run build

# ----- Runtime Stage -----
FROM node:20-alpine AS runner

WORKDIR /app

# Copy compiled app from builder
COPY --from=builder /app ./

EXPOSE 3000

# Start Next.js in production mode
CMD ["npm", "run", "start"]

