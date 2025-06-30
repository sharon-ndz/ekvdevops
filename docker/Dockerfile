# Stage 1: Build the NestJS app
FROM node:18-alpine AS builder

WORKDIR /app

# Copy only package files first for caching
COPY package*.json ./

# Install all dependencies including @nestjs/cli
RUN npm install

# Copy the rest of the source code
COPY . .

# Build the NestJS app (assumes main.ts and tsconfig etc. are here)
RUN npm run build

# Stage 2: Production image
FROM node:18-alpine

WORKDIR /app

# Copy package files and install production deps
COPY package*.json ./
RUN npm install --only=production

# Copy built app from builder
COPY --from=builder /app/dist ./dist

EXPOSE 4000
CMD ["node", "dist/main.js"]

