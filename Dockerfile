# Stage 1: Build da aplicação Angular
FROM node:22-alpine AS build

WORKDIR /app

# Copia package.json e package-lock.json
COPY package*.json ./

# Instala dependências
RUN npm ci

# Copia o código fonte
COPY . .

# Build da aplicação para produção
RUN npm run build

# Debug: mostra o conteúdo do diretório dist
RUN echo "=== Conteúdo de /app/dist ===" && \
    ls -la /app/dist || echo "Pasta dist não existe" && \
    echo "=== Estrutura completa ===" && \
    find /app/dist -type f 2>/dev/null || echo "Nada encontrado"

# Stage 2: Servidor Nginx
FROM nginx:alpine

# Remove a configuração padrão do Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copia a configuração customizada do Nginx
COPY default.conf /etc/nginx/conf.d/default.conf

# Copia os arquivos buildados do Angular do stage anterior
# Tentando diferentes caminhos possíveis do Angular 21
COPY --from=build /app/dist /usr/share/nginx/html

# Expõe a porta 80
EXPOSE 80

# Comando para iniciar o Nginx
CMD ["nginx", "-g", "daemon off;"]