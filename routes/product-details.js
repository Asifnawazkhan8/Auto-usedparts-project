const express = require('express')
const router = express.Router();
const Part = require('../model/part');
const csrf = require('csurf');


const csrfProtection = csrf({
    cookie: true,
    secure: true,
    httpOnly: true
})
router.get('/:alias', csrfProtection, async (req, res) => {
    try {
        const alias = req.params.alias;
        
        // Fetch the part based on the alias
        const part = await Part.findOne({ alias });

        if (!part) {
            // Handle case where part with the given alias is not found
            return res.status(404).send("Part not found");
        }

        // Fetch related parts based on the partsCode
        const relatedParts = await Part.find({ partsCode: part.partsCode }).limit(4);

        // Determine the base URL based on your route structure
        const baseUrl = '/all-products';

        // Determine the URL for the current page
        const url = `/product-details/${alias}`;


        res.status(200).render('product-details', {
            csrfToken: req.csrfToken(),
            parts: part,
            url,
            baseUrl,
            relatedParts,
            partsArray: JSON.stringify(global.parts),
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;