const { db, bucket } = require("../admin/");
const BusBoy = require("busboy");
const path = require("path");
const os = require("os");
const fs = require("fs");
const uuid = require("uuid-random");

const addImage = async (req, res) => {
  let data = {};
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

  let imageFileName = {};
  let imagesToUpload = [];
  let imageToAdd = {};

  const busboy = new BusBoy({ headers: req.headers });

  //This triggers for each file type that comes in the form data
  busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
    // Getting extension of any image
    const imageExtension = filename.split(".")[filename.split(".").length - 1];
    // Setting filename
    imageFileName = uuid() + "." + imageExtension;
    // Creating path
    const filepath = path.join(os.tmpdir(), imageFileName);
    imageToAdd = {
      imageFileName,
      filepath,
      mimetype
    };

    file.pipe(fs.createWriteStream(filepath));
    //Add the image to the array
    imagesToUpload.push(imageToAdd);
  });

  busboy.on("finish", async () => {
    let promises = [];
    let imageUrls = [];
    imagesToUpload.forEach(imageToBeUploaded => {
      imageUrls.push(imageToBeUploaded.imageFileName);
      promises.push(
        bucket.upload(imageToBeUploaded.filepath, {
          destination: `${accountId}/${imageToBeUploaded.imageFileName}`,
          resumable: false,
          metadata: {
            metadata: {
              contentType: imageToBeUploaded.mimetype
            }
          }
        })
      );
    });

    try {
      await Promise.all(promises);

      data["images"] = imageUrls.concat(existingImages);
      data["modifiedAt"] = new Date().getTime();
      db.doc(`/accounts/${accountId}`).set(data, { merge: true });

      res
        .status(200)
        .json({ msg: "Successfully uploaded all images", data: imageUrls });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  busboy.end(req.rawBody);

  // try {
  //   const busboy = new BusBoy({ headers: req.headers });

  //   busboy.on("file", (fieldname, file, filename, encoding, mimeType) => {
  //     if (filename.length > 0) {
  //       let imageExtension = filename.split(".")[
  //         filename.split(".").length - 1
  //       ];
  //       let imageName = new ObjectID();
  //       let imageFileName = `${imageName}.${imageExtension}`;
  //       let filepath = path.join(os.tmpdir(), imageFileName);
  //       let destination = `${accountId}/${imageFileName}`;

  //       console.log("filepath", filepath);
  //       imageData.push({ filepath, destination, mimeType });

  //       //Just keeps track of file uploads (how many uploaded).
  //       ++counter;
  //       ++fileCounter;

  //       //storing the uploaded photo
  //       fstream = fs.createWriteStream(filepath);

  //       fstream.on("close", () => {
  //         images.push(imageFileName);
  //         if (--counter === 0 && finished) {
  //           try {
  //             data["images"] = images.concat(existingImages);
  //             data["modifiedAt"] = new Date().getTime();
  //             db.doc(`/accounts/${accountId}`).set(data, { merge: true });

  //             console.log("images: ", imageData);

  //             // imageData.map(imgData => {
  //             //   bucket.upload(imgData.filepath, {
  //             //     resumable: false,
  //             //     destination: imgData.destination,
  //             //     metadata: {
  //             //       metadata: {
  //             //         contentType: imgData.mimeType
  //             //       }
  //             //     }
  //             //   });
  //             // });

  //             return res.json({
  //               message: "Image uploaded successfully",
  //               images
  //             });
  //           } catch (err) {
  //             return res.json({ error: err.message });
  //           }
  //         }
  //       });

  //       file.pipe(fstream);
  //     } else {
  //       file.resume();
  //     }
  //   });

  //   busboy.on("finish", () => {
  //     finished = true;
  //     if (fileCounter === 0) {
  //       return res.status(400).json({ error: "No image file attached" });
  //     }
  //   });

  //   busboy.end(req.rawBody);
  // } catch (error) {
  //   return res.send({ error: err.message });
  // }
};

module.exports = {
  addImage
};
