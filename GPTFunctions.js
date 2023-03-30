const { MessageMedia } = require("whatsapp-web.js");
const { Configuration, OpenAIApi } = require("openai");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const configuration = new Configuration({
  apiKey: process.env.OPENAI_KEY,
});
const openai = new OpenAIApi(configuration);

const GPTTextResponse = async (message) => {
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: message,
    temperature: 0,
    max_tokens: 256,
  });
  return response.data.choices[0].text;
};

const GPTImageResponse = async (message) => {
  const response = await openai.createImage({
    prompt: message,
    n: 1,
    size: "1024x1024",
  });
  const generatedImage = await MessageMedia.fromUrl(response.data.data[0].url);
  return generatedImage;
};

const optimizeImage = async () => {
  const inputFile = "sampleImage.jpg";
  const outputFile = "replaceImage.png";
  const info = await sharp(inputFile)
    .resize({ height: 512, width: 512 })
    .toFile(outputFile);
  return info;
};
const GPTImageVariations = async () => {
  const response = await openai.createImageVariation(
    fs.createReadStream("replaceImage.png"),
    1,
    "512x512"
  );
  const generatedImageVariation = await MessageMedia.fromUrl(
    response.data.data[0].url
  );
  return generatedImageVariation;
};

module.exports = {
  GPTImageResponse,
  GPTTextResponse,
  GPTImageVariations,
  optimizeImage,
};
