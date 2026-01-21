# Stage 1: Build the Angular application
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package.json and package-lock.json to leverage Docker cache
COPY package*.json ./
RUN npm install

# Copy the rest of the application files
COPY . .

# Build the application for production
# The output will be in /app/dist/ based on angular.json
RUN npm run build -- --configuration production

# Stage 2: Serve the application with Nginx
FROM nginx:stable-alpine

# Copy the built application from the builder stage
# The source path /app/dist/app comes from the outputPath in angular.json
COPY --from=builder /app/dist/. /usr/share/nginx/html

# When the container starts, nginx will serve the files from /usr/share/nginx/html
EXPOSE 80
