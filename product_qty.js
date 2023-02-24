const WebSocket = require('ws')
const redis = require('redis')
const wss = new WebSocket.Server({ port: 3002 })
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
  var query = url.parse(req.url, true).query;
  var product_id = query.productId;
  var channel_name = query.channelName
  if (product_id && channel_name) {
    (async () => {
      ws.send(await client.get(product_id));
    })();

    (async () => {
      await listener.subscribe(channel_name, (message) => {
        if (message == product_id) {
          (async () => {
            ws.send(await client.get(product_id));
          })();
        }
      });
    })();  
      
  } else {
    ws.send('Channel Name and product id is required')
      ws.close();
  }
})