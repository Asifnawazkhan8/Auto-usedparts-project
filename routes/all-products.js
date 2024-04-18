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
        const totalParts = await Part.count();
        const totalPages = Math.floor(totalParts / 10);
        const parts = await Part.find().sort({ $natural: 1 }).limit(10);
        
        res.status(200).render('parts-template', {
            csrfToken: req.csrfToken(),
            parts,
            prePage: 0, 
            currPage: 1,
            nextPage: 2,
            nextNextPage: 3,
            totalPages,
            url: req.baseUrl,
            partsCount: global.partsCount,
            partsArray: global.parts,
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Internal Server Error");
    }
});

router.get('/page/:id', csrfProtection, async (req, res) => {
        var query = isNaN(req.params.id) ? 0 : req.params.id <= 1 ? 1 : parseInt(req.params.id) || 0;
        var totalPages;
        var parts;
        Part.count()
        .then(data => {
            totalPages = data;
            totalPages = Math.floor(totalPages/10);
            query = query > totalPages ? totalPages : query;
            var pageCount = query * 10;
            Part.find({count:{ $gte : pageCount, $lt : pageCount + 10}})
            .then(data =>{
                parts = data;
                res.status(200).render('parts-template',{csrfToken: req.csrfToken(), parts, prePage:(query <= 0) ? 1: query-1, currPage: query, nextPage: query + 1, nextNextPage: query + 2, totalPages,url:req.baseUrl,partsCount:global.partsCount, partsArray:JSON.stringify(global.parts) })
            })
            .catch(err =>{
                console.error(err.message);
                res.status(500).send("Internal Server Error");    
            });
        }).catch(err =>{
            console.error(err.message);
            res.status(500).send("Internal Server Error");    
        });
   
})
  
module.exports = router;