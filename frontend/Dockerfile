FROM node:18-alpine AS build
WORKDIR /app

# Allow passing API base at build time
ARG VITE_API_URL=''
ENV VITE_API_URL=${VITE_API_URL}

COPY package*.json ./
RUN npm ci --silent
COPY . .
RUN npm run build

FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY ./infra/frontend-nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
