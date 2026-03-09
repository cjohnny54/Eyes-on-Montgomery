# Use Node.js 20
FROM node:20

# Set working directory
WORKDIR /app

# Install build dependencies for better-sqlite3 and other native modules
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Install tsx globally
RUN npm install -g tsx

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy application source code
COPY . .

# Expose the application port
EXPOSE 3000

# Start the application in development mode
CMD ["npm", "run", "dev"]
