# Use an official Node.js runtime as a parent image
FROM node:20-slim

# Install OpenSSL, required by Prisma
RUN apt-get update && apt-get install -y openssl

# Set the working directory in the container
WORKDIR /app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy app source code
COPY . .

# Build the TypeScript application
RUN npm run build

# Set the environment to production
ENV NODE_ENV=production

# Expose the port the app runs on
EXPOSE 8080

# Run the web service on container startup
CMD [ "npm", "start" ]