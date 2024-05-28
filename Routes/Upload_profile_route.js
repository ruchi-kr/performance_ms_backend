const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const connection = require("../db");

const upload = multer({ dest: 'uploads/' });
// Endpoint for inserting image
router.post('/uploadprofile', upload.single('avatar'), (req, res) => {
    if (!req.file) {
      return res.status(400).send('No file uploaded');
    }
  
    // Read the uploaded file
    const image = req.file.buffer;
  
    // Insert the image into the database
    const query = 'INSERT INTO employee_master (profile_img) VALUES (?)';
    connection.query(query, [image], (error, results) => {
      if (error) {
        console.error('Error inserting image into database:', error);
        return res.status(500).send('Error inserting image into database');
      }
      console.log('Image inserted into database');
      res.status(200).send('Image uploaded and inserted successfully');
    });
  });
  
  // Endpoint for editing image
  router.put('/editprofile/:id', upload.single('avatar'), (req, res) => {
    if (!req.file) {
      return res.status(400).send('No file uploaded');
    }
  
    // Read the uploaded file
    const image = req.file.buffer;
  
    // Update the image in the database
    const query = 'UPDATE employee_master SET profile_img = ? WHERE id = ?';
    connection.query(query, [image, req.params.id], (error, results) => {
      if (error) {
        console.error('Error updating image in database:', error);
        return res.status(500).send('Error updating image in database');
      }
      console.log('Image updated in database');
      res.status(200).send('Image edited and updated successfully');
    });
  });



module.exports = router;