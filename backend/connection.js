const mongoose= require('mongoose')

 function connection(url){
    return mongoose.connect(url)
}

module.exports= connection