# server-side-tms
NodeJS Application to run any TMS from Server-Side

npm install

npm start

This is more a proof of concept is not a fully developed solution. It can work fine on some not high events environments, but you need to have some things in mind: 

1. Code is not curated, it may have bugs
2. Current queue is stateless, so any events not send when the process is closed will be lost
