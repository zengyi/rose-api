const { db } = require("../admin/");
const ObjectID = require("mongodb").ObjectID;

const createAccount = (req, res) => {
  const accountId = new ObjectID();
  const data = { ...req.body };

  try {
    data["createdAt"] = new Date().getTime();

    db.doc(`/accounts/${accountId}`).set(data);
    return res.status(201).json({
      message: "Account created successfully",
      data: { id: accountId, ...data }
    });
  } catch (err) {
    return res.send({ error: err.message });
  }
};

module.exports = {
  createAccount
};
