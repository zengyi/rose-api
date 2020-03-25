const { db } = require("../admin");

const findAccounts = (req, res) => {
  data = [];
  db.collection("accounts")
    .where("bizId", "==", "HPxJZRUE37RO5NSRVMt3GiAB9i02")
    // .where("bizId", "==", req.user.bizId)
    .get()
    .then(snapshot => {
      if (snapshot.empty) {
        return res.status(404).json({ error: "No document found" });
      }
      snapshot.forEach(doc => {
        data.push({ id: doc.id, ...doc.data() });
      });
      return res.json(data);
    })
    .catch(err => {
      return res.status(error.code).json({ error: err.message });
    });
};

module.exports = {
  findAccounts
};
