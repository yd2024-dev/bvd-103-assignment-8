# Step 1: Use Node.js base image
FROM node:20-alpine as build

# Step 2: Set the working directory inside the container
WORKDIR /app

# Step 3: Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Step 4: Install the dependencies
RUN npm install

# Step 5: Copy the rest of the application code
COPY . .

# Step 6: Build the front-end (assuming React or a similar framework)
RUN npm run build

# Step 7: Use an nginx server to serve the built front-end
FROM nginx:alpine

# Step 8: Copy the built front-end to the nginx folder
COPY --from=build /app/build /usr/share/nginx/html

# Step 9: Expose the relevant port (8080 for front-end)
EXPOSE 8080

# Step 10: Start the nginx server
CMD ["nginx", "-g", "daemon off;"]
