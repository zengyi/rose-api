const { db, bucket } = require("../admin/");

const removeImage = async (req, res) => {
  const accountId = req.body.accountId;
  const bizId = req.body.bizId;
  const imageName = req.body.imageName;

  // if (!accountId)
  //   return res.status(400).json({ error: "Bad request, missing aid" });
  // if (!bizId)
  //   return res.status(400).json({ error: "Bad request, missing bod" });
  // if (!imageName)
  //   return res.status(400).json({ error: "Bad request, missing img" });
  // // if (!accountId || !bizId || !imageName)
  // //   return res.status(400).json({ error: "Bad request, missing identifier" });

  const doc = await db.doc(`/accounts/${accountId}`).get();

  if (!doc.exists) {
    return res.status(404).json({ error: "Not Found" });
  } else {
    const currentData = doc.data();
    if (bizId != currentData["bizId"])
      return res.status(401).json({ error: "Unauthorized" });
    existingImages = currentData["images"] || [];
  }

  bucket
    .file(`${accountId}/${imageName}`)
    .delete()
    .then(() => {
      const data = {};
      data["images"] = existingImages.filter(img => img !== imageName);
      data["modifiedAt"] = new Date().getTime();
      db.doc(`/accounts/${accountId}`).set(data, { merge: true });
    })
    .then(() => {
      return res.json({
        message: "Image Removed Successfully",
        data: imageName
      });
    })
    .catch(err => {
      return res.status(400).json({ error: err.message });
    });
};

module.exports = {
  removeImage
};
