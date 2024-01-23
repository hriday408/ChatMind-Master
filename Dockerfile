#BUILD STAGE
FROM node:18-alpine AS builder

#COMMON
WORKDIR /usr/src/app
COPY package*.json ./
RUN yarn install 
COPY . .
RUN npx prisma generate
RUN yarn run build


#PROD STAGE
FROM node:18-alpine 

WORKDIR /usr/src/app

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

COPY --from=builder usr/src/app/prisma ./prisma
COPY --from=builder usr/src/app/package*.json ./
COPY --from=builder usr/src/app/dist ./dist

RUN yarn install --production

EXPOSE 3000

CMD ["yarn","run" ,"start:prodserver"]