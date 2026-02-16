FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Install dependencies
WORKDIR /app/server
RUN npm ci
WORKDIR /app/client
RUN npm ci

# Copy source code
WORKDIR /app
COPY . .

# Build frontend
WORKDIR /app/client
RUN npm run build

# Build backend
WORKDIR /app/server
RUN npm run build

# Expose port
EXPOSE 3001

# Start server
CMD ["node", "dist/index.js"]
