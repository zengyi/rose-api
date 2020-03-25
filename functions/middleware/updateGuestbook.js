const { db } = require("../admin/");

const updateGuestbook = async (req, res) => {
  const accountId = req.params.aid;
  let data = {};
  let guestbook = [];

  const guestName = req.body.guestName;
  const message = req.body.message;

  if (!accountId || !guestName || !message)
    return res.status(400).json({ error: "Bad request, missing identifier" });

  const guestbookMsg = {
    guestName,
    message,
    createdAt: new Date().getTime()
  };

  const doc = await db.doc(`/accounts/${accountId}`).get();

  if (!doc.exists) {
    return res.status(404).json({ error: "Not Found" });
  } else {
    const currentData = doc.data();
    // if (accountId != currentData["bizId"])
    //   return res.status(401).json({ error: "Unauthorized" });
    guestbook = currentData["guestbook"] || [];
  }

  try {
    guestbook.push(guestbookMsg);

    data.guestbook = guestbook;

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
  updateGuestbook
};
