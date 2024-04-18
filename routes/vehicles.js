const express = require('express')
const router = express.Router();
const Part = require('../model/part');
const csrf = require('csurf');

const csrfProtection = csrf({
    cookie: true,
    secure: true,
    httpOnly: true
})
router.get('/', csrfProtection, async (req, res) => {
    try {
        const url = req.baseUrl.split('/').pop();
        var regex = new RegExp("^" + url);
        const parts = await Part.find({code:regex}).limit(10);
        res.status(200).render('parts-template',{csrfToken: req.csrfToken(), parts, prePage: 0, currPage: 0, nextPage: 1, nextNextPage: 2, totalPages: 50 , url:req.baseUrl,partsCount:global.partsCount, partsArray:JSON.stringify(global.parts) })
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

router.get('/page/:id', csrfProtection, async (req, res) => {
    const url = req.baseUrl.split('/').pop();
    const regex = new RegExp("^" + url);
    var query = isNaN(req.params.id) ? 0 : req.params.id <= 0 ? 0 : parseInt(req.params.id) || 0;
    var totalPages;
    var parts;
    Part.count({ code: regex })
    .then(data => {
        totalPages = data;
        totalPages = Math.floor(totalPages/10);
        query = query > totalPages ? totalPages : query;
        var pageCount = query * 10;
        Part.find({ code: regex }) .skip(pageCount).limit(10)
        .then(data =>{
            parts = data;
            res.status(200).render('parts-template',{csrfToken: req.csrfToken(), parts, prePage:(query <= 0) ? 1: query-1, currPage: query, nextPage: query + 1, nextNextPage: query + 2, totalPages, url: req.baseUrl, partsCount:global.partsCount, partsArray:JSON.stringify(global.parts) })
        })
        .catch(err =>{
            console.error(err.message);
            res.status(500).send("Internal Server Error");    
        });
    }).catch(err =>{
        console.error(err.message);
        res.status(500).send("Internal Server Error");    
    });

});

module.exports = router;