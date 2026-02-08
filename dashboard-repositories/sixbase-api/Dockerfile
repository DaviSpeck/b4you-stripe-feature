# Build stage
FROM node:22-alpine AS builder
WORKDIR /usr/app

# Copy package files
COPY package.json yarn.lock ./

# Install all dependencies (including dev dependencies)
RUN yarn install --frozen-lockfile --production=false

# Copy application code
COPY . .

# Production stage
FROM node:22-alpine AS production
WORKDIR /usr/app

# Copy package files
COPY package.json yarn.lock ./

# Install only production dependencies
RUN yarn install --frozen-lockfile --production=true && \
    yarn cache clean

# Copy application code
COPY . .

# Expose port
EXPOSE 5500

# Start application
CMD ["node", "server.js"]
