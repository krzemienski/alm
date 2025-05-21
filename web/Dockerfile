FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package.json ./
RUN npm install

# Copy source
COPY . .

# Expose port
EXPOSE 3000

# Start the application in development mode (includes build)
CMD ["npm", "run", "dev"]
