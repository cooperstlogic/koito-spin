# Branding folders (see branding/README.md). A build picks one with the BRANDING build arg.
FROM scratch AS branding
COPY ./branding /

FROM --platform=$BUILDPLATFORM node AS frontend

ARG KOITO_VERSION
ENV VITE_KOITO_VERSION=$KOITO_VERSION
ARG SITE_TITLE
ENV VITE_SITE_TITLE=$SITE_TITLE
ARG SOURCE_URL
ENV VITE_SOURCE_URL=$SOURCE_URL
ARG BRANDING
ENV BUILD_TARGET=docker

WORKDIR /client
RUN npm install -g corepack
RUN corepack enable && corepack prepare yarn@4 --activate
COPY ./client .
RUN yarn install

# Apply branding: icons (and optionally record.svg / site.webmanifest) from branding/$BRANDING/public,
# then the web app's name from SITE_TITLE.
COPY --from=branding / /branding
RUN if [ -n "$BRANDING" ]; then \
      test -d "/branding/$BRANDING/public" || { echo "BRANDING=$BRANDING: no branding/$BRANDING/public folder" >&2; exit 1; }; \
      cp -r "/branding/$BRANDING/public/." ./public/; \
    fi && \
    if [ -n "$VITE_SITE_TITLE" ]; then \
      node -e 'const fs=require("fs"),f="public/site.webmanifest",m=JSON.parse(fs.readFileSync(f,"utf8"));m.name=m.short_name=process.env.VITE_SITE_TITLE;fs.writeFileSync(f,JSON.stringify(m,null,2)+"\n")'; \
    fi

RUN yarn run build

RUN find ./build/client -type f \( -name "*.js" -o -name "*.css" -o -name "*.html" -o -name "*.svg" \) -exec gzip -k -9 {} \;

FROM golang:1.26 AS backend

ARG KOITO_VERSION
ENV CGO_ENABLED=1
ENV GOOS=linux

WORKDIR /app

RUN apt-get update && \
	apt-get install -y libvips-dev pkg-config && \
	rm -rf /var/lib/apt/lists/*

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN go build -ldflags "-X main.Version=$KOITO_VERSION" -o app ./cmd/api


FROM debian:bookworm-slim AS final

WORKDIR /app

RUN apt-get update && \
	apt-get install -y libvips42  && \
	rm -rf /var/lib/apt/lists/*

COPY --from=backend /app/app ./app
COPY --from=frontend /client/build ./client/build
COPY --from=frontend /client/public ./client/public
COPY ./assets ./assets
COPY ./db ./db

EXPOSE 4110

ENTRYPOINT ["./app"]
