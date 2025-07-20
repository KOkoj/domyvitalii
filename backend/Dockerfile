# Use Node.js 18 LTS
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY backend/package*.json ./

# Install ALL dependencies (including devDependencies for building)
RUN npm install

# Copy all backend source code (including Prisma schema)
COPY backend/ .

# Generate Prisma client
RUN npx prisma generate

# Build the application (this needs devDependencies)
RUN npm run build

# Clean up devDependencies after build to reduce image size
RUN npm ci --only=production && npm cache clean --force

# Expose port
EXPOSE 3001

# Start the application
CMD ["npm", "start"] 