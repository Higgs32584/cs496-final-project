# The API server (Express + Mongoose). The website has its own image in my-app/.
FROM node:24-slim

WORKDIR /app

# install production dependencies first so this layer is cached until package.json changes
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY app.js ProjectServer.js ./
COPY controller ./controller
COPY model ./model
COPY util ./util

# HOST must be 0.0.0.0, or the server is unreachable from outside the container.
# NODE_ENV=production makes the server use DB_URI (the main database).
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=4000

USER node
EXPOSE 4000

CMD ["node", "ProjectServer.js"]
