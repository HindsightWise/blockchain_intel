FROM node:18-alpine

# Create app directory
WORKDIR /app

# Install app dependencies
COPY backend/package*.json ./
RUN npm install

# Bundle app source
COPY backend/ ./

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

CMD ["node", "src/index.js"]