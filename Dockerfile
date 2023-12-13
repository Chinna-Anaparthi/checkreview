FROM node:16-alpine

WORKDIR /ReviewPoints

# Copy only package.json and package-lock.json first to leverage Docker cache
COPY ReviewPoints/package.json ReviewPoints/package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files from the correct directory
COPY ReviewPoints . / 

# Set the entry point
ENTRYPOINT npm run start


