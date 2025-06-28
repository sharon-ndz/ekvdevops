# Stage 1: Build the NestJS app
FROM node:18-alpine AS builder

WORKDIR /app

# Copy only package files first for caching
COPY package*.json ./

# Install all dependencies including @nestjs/cli
RUN npm install

# Copy the full source code
COPY . .

# Build the NestJS app (uses nest CLI)
RUN npm run build

# Stage 2: Production image
FROM node:18-alpine

WORKDIR /app

# Copy only necessary files
COPY package*.json ./
RUN npm install --only=production

# Copy the built output from previous stage
COPY --from=builder /app/dist ./dist

EXPOSE 4000
CMD ["node", "dist/src/main.js"]

