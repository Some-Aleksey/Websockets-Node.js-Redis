const WebSocket = require('ws')
const redis = require('redis')
const wss = new WebSocket.Server({ port: 3001 })
const listener = redis.createClient();
const client = redis.createClient();
const url = require('url');

(async () => {
    await listener.connect();
})();
listener.on("ready", () => {
    console.log("Listener aviable");
});
listener.on("error", (err) => {
    console.log("Error in listener connection");
});

(async () => {
    await client.connect();
})();
client.on("ready", () => {
    console.log("Client aviable");
});
client.on("error", (err) => {
    console.log("Error in client connection");
});
client.SELECT(4);


wss.on('connection', (ws,req) => {
    var channel_name = url.parse(req.url, true).query.channelName
    if (channel_name) {
        (async () => {
            await listener.subscribe(channel_name, (message) => {
                (async () => {
                    ws.send(JSON.stringify(await client.HGETALL(message)));
                })();
            });
        })();
    } else {
        ws.send('Channel name is required')
        ws.close();
    }  
})