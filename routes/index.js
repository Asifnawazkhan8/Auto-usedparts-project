const express = require('express');
const router = express.Router();
const csrf = require('csurf');
const csrfProtection = csrf({
    cookie: true,
    secure: true,
    httpOnly: true
})

router.get('/',csrfProtection , async (req, res) => {
    try {
        res.status(200).render('index',{csrfToken: req.csrfToken(), partsCount:global.partsCount, partsArray:JSON.stringify(global.parts)})
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
  })

  module.exports = router;