const express = require('express');
const router = express.Router();
const connection = require("../db");

// Assuming you have a database connection and a Designation model

router.get('/designations/search', async (req, res) => {
  try {
    const { designation } = req.query;

    // Search for designations that match the given designation
    const query= 'SELECT * FROM designations WHERE designation ILIKE `%${designation}%`';
    // const results = await Designation.find({ designation: { $regex: designation, $options: 'i' } });
    connection.query(query,  (err, results) => {
        if (err) throw err;
        res.status(200).send('searched Successfully');
    });
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;