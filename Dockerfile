# Ensaio às Competências Digitais: imagem para alojar a aplicação num servidor próprio (escolas, entidades).
# Construir:  docker build -t ecd .            (opcional: --build-arg VITE_TELEMETRIA_URL=https://script.google.com/…)
# Correr:     docker run -p 8080:8080 ecd       e abrir http://localhost:8080
# Sem Worker: o backoffice de textos não está disponível; a aplicação usa os textos do código.

FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG VITE_TELEMETRIA_URL=""
ENV VITE_TELEMETRIA_URL=$VITE_TELEMETRIA_URL
RUN npm run build

FROM nginxinc/nginx-unprivileged:1.27-alpine
LABEL org.opencontainers.image.title="Ensaio às Competências Digitais" \
      org.opencontainers.image.description="Treino gratuito, em português de Portugal, das competências digitais que as provas em computador pressupõem." \
      org.opencontainers.image.source="https://github.com/eduardon83/ensaio-competencias-digitais" \
      org.opencontainers.image.licenses="MIT AND CC-BY-4.0" \
      org.opencontainers.image.vendor="Kendir Studios (Worlds4Education - Jogos e Ambientes Educativos, Lda.)"
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
