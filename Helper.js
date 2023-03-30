const fs = require("fs");
const path = require("path");
const saveToDir = async (bufferString) => {
  const bufferImage = Buffer.from(bufferString, "base64");
  fs.writeFile("sampleImage.jpg", bufferImage, (err) => {
    if (err) {
      console.log("Error saving image: ", err);
    } else {
      console.log("Image saved successfully");
    }
  });
};
module.exports = { saveToDir };
