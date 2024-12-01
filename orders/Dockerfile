# Step 1: Use Node.js base image
FROM node:20-alpine

# Step 2: Set the working directory inside the container
WORKDIR /app

# Step 3: Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Step 4: Install the dependencies
RUN npm install

# Step 5: Copy the rest of the application code
COPY . .

# Step 6: Set environment variables (overridden by Docker Compose at runtime)
ENV DB_HOST=localhost
ENV DB_PORT=27017
ENV DB_NAME=ordersdb
ENV RABBITMQ_URL=amqp://localhost

# Step 7: Expose the relevant port (3002 for orders)
EXPOSE 3002

# Step 8: Run the application using TypeScript execution (using tsx)
CMD ["npx", "-y", "tsx", "./index.ts"]
