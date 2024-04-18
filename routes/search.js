const express = require('express');
const router = express.Router();
const Part = require('../model/part');
const csrf = require('csurf');

const csrfProtection = csrf({
    cookie: true,
    secure: true,
    httpOnly: true
})
router.post('/', csrfProtection,async (req, res) => {
    try {
        var parts;
        var result = req.body.searchQuery ;
        var searchQuery = req.body.searchQuery.toUpperCase()
        ;
        if(searchQuery.includes('-')){
        parts = await Part.find({
            $or: [
            { name: { $regex: searchQuery } },
            { alias: { $regex: searchQuery } },
            
            ]
        });
        }
        else{
            searchQuery = searchQuery.slice(0,5)
        parts = await Part.find({
            $or: [
                { alias: { $regex: searchQuery } },
                { name: { $regex: searchQuery } }
                ]
        });
        }
        if (parts.length != 0){
    
            res.status(200).render('search',{csrfToken: req.csrfToken(), parts, result, partsArray:JSON.stringify(global.parts)});
        }else{
   
            res.status(404).render('notfound',{csrfToken: req.csrfToken()});
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
  
});
router.post('/predictions', async (req,res)=>{
    let payload = req.body.payload.trim();
    let parts = await Part.find({name: { $regex: new RegExp(payload,'i' )}}).exec();
    parts = parts.slice(0,10)
    res.send({payload: parts})
  });
module.exports = router;