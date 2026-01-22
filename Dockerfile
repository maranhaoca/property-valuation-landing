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

# Stage 2: Servidor Nginx
FROM nginx:alpine

# Remove a configuração padrão do Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copia a configuração customizada do Nginx
COPY nginx.conf /etc/nginx/conf.d/

# Copia os arquivos buildados do Angular do stage anterior
# Angular 21 gera em dist/<project-name>/browser por padrão
COPY --from=build /app/dist/property-valuation-landing/browser /usr/share/nginx/html

# Expõe a porta 80
EXPOSE 80

# Comando para iniciar o Nginx
CMD ["nginx", "-g", "daemon off;"]