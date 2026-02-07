FROM node:18-alpine

WORKDIR /usr/src/app

# install dependencies
COPY package.json ./
RUN npm install --production

# copy source
COPY . ./

ENV PORT=4000
EXPOSE 4000

CMD ["npm", "start"]
