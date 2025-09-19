# Stage 1: Build the React application
FROM node:20-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve the static files with Nginx
FROM nginx:1.25-alpine
# Copy the built files from the build stage
COPY --from=build /app/dist /usr/share/nginx/html
# Add a basic Nginx configuration that enables history mode for SPAs
RUN printf "server {\n    listen 8080;\n    server_name localhost;\n\n    root /usr/share/nginx/html;\n    index index.html;\n\n    location / {\n        try_files \$uri \$uri/ /index.html;\n    }\n}\n" > /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
