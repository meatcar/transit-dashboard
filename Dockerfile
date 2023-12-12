FROM denoland/deno:alpine-1.38.5

LABEL org.opencontainers.image.source=https://github.com/meatcar/transit-dashboard
LABEL org.opencontainers.image.description="Accessible transit dashboard using transitapp's API"
LABEL org.opencontainers.image.licenses=MIT

EXPOSE 8000

RUN mkdir /db && chown -R deno:deno /db
VOLUME /db
ENV CACHE_DB=/db/cache.sqlite3

RUN mkdir /app && chown -R deno:deno /app
USER deno
WORKDIR /app
ENV DENO_DIR=/app/.deno_cache
ENV XDG_CACHE_HOME=/app/.cache
RUN mkdir /app/.cache

ARG GIT_REVISION
ENV DENO_DEPLOYMENT_ID="${GIT_REVISION:?missing arg}"

COPY --chown=deno:deno . .
# RUN deno cache main.ts
RUN ls -al && deno task build

CMD ["task", "preview"]
