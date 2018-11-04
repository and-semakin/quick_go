FROM node:alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY config config
COPY scripts scripts
COPY public public
COPY src src
RUN npm run-script build

FROM nginx:stable-alpine
COPY nginx.conf.template .
EXPOSE 80
# default resolver for docker-compose network
# override this var if you use it in Kubernetes!
ENV NGINX_RESOLVER 127.0.0.11
RUN rm /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html
CMD /bin/sh -c "envsubst '\$NGINX_RESOLVER' < /nginx.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"
