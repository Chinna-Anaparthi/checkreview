FROM node:16-alpine

WORKDIR /checkreview

# Copy only package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files from the correct directory
COPY  . . 

# Set the entry point
ENTRYPOINT npm run start


