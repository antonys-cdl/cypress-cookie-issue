FROM cypress/included:12.5.1

WORKDIR /home/node/project

ADD package.json ./
ADD hosts.js index.js ./

ADD cypress ./cypress
ADD cypress.config.js ./

RUN npm install

ENTRYPOINT [ "npm", "test" ]
