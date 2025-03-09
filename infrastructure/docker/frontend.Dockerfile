FROM node:18-alpine as build

# Create app directory
WORKDIR /app

# Install app dependencies
COPY frontend/package*.json ./
RUN npm install

# Bundle app source
COPY frontend/ ./

# Build the app
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy build files to nginx
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx config
COPY infrastructure/nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]