const { db } = require("../admin/");

const updateAccount = async (req, res) => {
  const accountId = req.params.aid;
  if (!accountId)
    return res.status(400).json({ error: "Bad request, missing identifier" });

  const doc = await db.doc(`/accounts/${accountId}`).get();
  if (!doc.exists) {
    return res.status(404).json({ error: "Not Found" });
  }

  const data = { ...req.body };

  try {
    data["modifiedAt"] = new Date().getTime();

    db.doc(`/accounts/${accountId}`).set(data, { merge: true });
    return res.status(200).json({
      message: "Account updated successfully",
      data: { id: accountId, ...data }
    });
  } catch (err) {
    return res.send({ error: err.message });
  }
};

module.exports = {
  updateAccount
};
