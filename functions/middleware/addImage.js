const { db, bucket } = require("../admin/");
const BusBoy = require("busboy");
const path = require("path");
const os = require("os");
const fs = require("fs");
const uuid = require("uuid-random");

const addImage = async (req, res) => {
  let images = [];
  let data = {};
  let imageData = {};
  let finished = false;
  let counter = 0;
  let fileCounter = 0;
  let existingImages = [];

  const accountId = req.params.aid;
  if (!accountId)
    return res.status(400).json({ error: "Bad request, missing identifier" });

  const doc = await db.doc(`/accounts/${accountId}`).get();

  if (!doc.exists) {
    return res.status(404).json({ error: "Not Found" });
  } else {
    const currentData = doc.data();
    // if (accountId != currentData["bizId"])
    //   return res.status(401).json({ error: "Unauthorized" });
    existingImages = currentData["images"] || [];
  }

  try {
    const busboy = new BusBoy({ headers: req.headers });

    busboy.on("file", (fieldname, file, filename, encoding, mimeType) => {
      if (filename.length > 0) {
        let imageExtension = filename.split(".")[
          filename.split(".").length - 1
        ];
        let imageName = accountId + "-" + uuid();
        let imageFileName = `${imageName}.${imageExtension}`;
        let filepath = path.join(os.tmpdir(), imageFileName);
        imageData = { filepath, mimeType };

        //Just keeps track of file uploads (how many uploaded).
        ++counter;
        ++fileCounter;

        //storing the uploaded photo
        fstream = fs.createWriteStream(filepath);

        fstream.on("close", () => {
          bucket
            .upload(imageData.filepath, {
              resumable: false,
              destination: `/${imageFileName}`,
              metadata: {
                metadata: {
                  contentType: imageData.mimeType
                }
              }
            })
            .then(() => {
              images.push(imageFileName);
              if (--counter === 0 && finished) {
                try {
                  data["images"] = images.concat(existingImages);
                  data["modifiedAt"] = new Date().getTime();
                  db.doc(`/accounts/${accountId}`).set(data, { merge: true });
                  return res.json({
                    message: "Image uploaded successfully",
                    images
                  });
                } catch (err) {
                  return res.json({ error: err.message });
                }
              }
            });
        });

        file.pipe(fstream);
      } else {
        file.resume();
      }
    });

    busboy.on("finish", () => {
      finished = true;
      if (fileCounter === 0) {
        return res.status(400).json({ error: "No image file attached" });
      }
    });

    busboy.end(req.rawBody);
  } catch (error) {
    return res.send({ error: err.message });
  }
};

module.exports = {
  addImage
};
