FROM node:20-alpine

WORKDIR /app

# Copy package management files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --only=production

# Copy remaining server code
COPY . .

EXPOSE 3001

CMD ["npm", "start"]
