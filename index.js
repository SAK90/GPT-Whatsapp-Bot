const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
require("dotenv").config();
const {
  GPTImageResponse,
  GPTTextResponse,
  GPTImageVariations,
  optimizeImage,
} = require("./GPTFunctions");

const { saveToDir } = require("./Helper.js");

const client = new Client({
  authStrategy: new LocalAuth(),
});

client.on("qr", (qr) => {
  console.log("qrcode");
  qrcode.generate(qr, { small: true });
});

client.on("authenticated", () => {
  console.log("Authenticated");
});

client.on("ready", () => {
  console.log("Bot ready");
  client.getChats().then((chats) => {
    const myGroup = chats.find((chat) => chat.name === process.env.GROUP_NAME);
    client.sendMessage(
      myGroup.id._serialized,
      "GPT--bot here at your service."
    );
  });
});

client.on("disconnected", () => {
  console.log("Bot disconnected");
  client.getChats().then((chats) => {
    const myGroup = chats.find((chat) => chat.name === process.env.GROUP_NAME);
    client.sendMessage(myGroup.id._serialized, "Bye fellas.");
  });
});

const getChatId = (chatName) => {
  return client
    .getChats()
    .then(
      (chats) => chats.find((chat) => chat.name === chatName).id._serialized
    )
    .catch((err) => console.error(err));
};

client.on("message", (message) => {
  getChatId(process.env.GROUP_NAME).then((TargetGroupId) => {
    const TargetMessageId = message.id.remote;
    if (TargetGroupId === TargetMessageId) {
      if (message.body.substring(0, 4) === ".gpt" && message.body[4] === " ") {
        GPTTextResponse(message.body.substring(5)).then((response) => {
          console.log(response);
          client.sendMessage(TargetGroupId, response.trim());
        });
      } else if (message.body.substring(0, 10) === ".gpt-image") {
        console.log(message.body.substring(0, 10), "fetching image");
        GPTImageResponse(message.body.substring(11)).then((generatedImage) => {
          client.sendMessage(TargetGroupId, generatedImage);
        });
      } else if (message.hasMedia) {
        saveToDir(message._data.body).then(() => {
          optimizeImage().then(() => {
            GPTImageVariations().then((generatedImage) => {
              client.sendMessage(TargetGroupId, generatedImage);
            });
          });
        });

        // GPTImageVariations(message._data.body).then(() => {
        //   client.sendMessage(TargetGroupId, "image link fetched");
        // });
        // genImage();
        // DownloadImage(message).then((image) => {
        //   GPTImageVariations(image).then((generatedImageVariation) => {
        //     client.sendMessage(TargetGroupId, generatedImageVariation);
        //   });
        // });
      }
    }
  });
});

client.initialize();
