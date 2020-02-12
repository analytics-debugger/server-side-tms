/*
name: Server-Side TMS
version: 1.0.0
author: David Vallejo (@thyng)
*/

/*
START CONFIGURATION
*/
const GTMContainerId = 'GTM-NQ8HPPG';
const endpointDomain = 'http://localhost';

/*
END CONFIGURATION
There's no need to change anything below this line
*/


const express = require('express');
const tools = require('./middleware/puppeteer')
const bodyParser = require('body-parser');
const cors = require('cors');
const express_json5 = require('express-json5')
const Queue = require('better-queue');

const queue = new Queue(function(input, cb) {
    if (!input.length) {
        input = [input]
    }
    const pushes = [];
    input.forEach(function(p) {
        const push = p.data.pushDetails;
        if (p.data.tms === 'gtm') {
            push.event = p.data.event;
            pushes.push(push);
        }
        if (p.data.tms === 'tealium') {
            utag.link(push);
        }
    })
    const execGTM = new Promise((resolve, reject) => {
        tools
            .execGTM(pushes, endpointDomain)
            .then(data => {
                resolve(data)
            })
            .catch(err => {
                console.log(err);
                reject('something went wrong :/ > ' + err.message)
            })
    })
    Promise.all([execGTM])
    cb(null, result);
}, {
    batchSize: 4,
    batchDelay: 30000,
    batchDelayTimeout: 30000
});

const app = express();
const config = {
    port: 80
};

app.use(cors());
app.use(express_json5());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

app.post('/event/:eventId?', (req, res) => {
    const eventId = req.params.eventId;
    // Sanity checks
    if (!eventId) {
        res.status(403).json({
            status: 'ko',
            statusText: 'Missing eventId',
        });
        return;
    }

    if (!eventId.match(/^([a-zA-Z0-9_-]){3,64}$/)) {
        res.status(403).json({
            status: 'ko',
            statusText: 'eventId must be 3 to 64 characters long alphanumeric string',
        });
        return;
    }

    const status = queue.push({
        data: {
            event: eventId,
            tms: 'gtm',
            pushDetails: req.body
        }
    });
    res.status(200).json({
        status: status.status,
        data: {
            event: eventId,
            tms: 'gtm',
            pushDetails: req.body
        }
    });
});

app.get('/status', (req, res) => {
    res.status(403).json(queue.getStats());
});

app.get('/load', (req, res) => {
    res.send(`<html>
    <head>
    <script>
    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','${GTMContainerId}');
    </script>
    </head>
    <body></body></html>`);
});
app.listen(config.port, () => console.log(`Listening on port ${config.port}!`))