const requireAuth= (req,res,next)=>{
    const {authorization}= req.headers
    console.log("Auth Token==> ",authorization);
}

module.exports = requireAuth;