const { db } = require("../admin");

const findAccount = (req, res) => {
  db.doc(`/accounts/${req.params.id}`)
    .get()
    .then(doc => {
      if (!doc.exists) {
        return res.status(404).json({ error: "Not Found" });
      } else {
        return res.status(200).json(doc.data());
      }
    })
    .catch(err => {
      return res.status(err.code).json({ error: err.message });
    });
};

module.exports = {
  findAccount
};
