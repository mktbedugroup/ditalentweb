# Use an official Node.js runtime as a parent image
FROM node:18-slim

RUN apt-get update -y && apt-get install -y openssl

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install app dependencies
# Using --legacy-peer-deps to avoid issues with some dependencies
RUN npm install --legacy-peer-deps

# Copy the prisma directory
COPY prisma ./prisma

# Generate Prisma client
RUN npx prisma generate

# Copy the rest of the application's code
COPY . .

# Make port 8080 available to the world outside this container
EXPOSE 8080

# Define the command to run the app
CMD ["npm", "run", "dev"]
