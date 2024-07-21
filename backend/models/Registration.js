const mongoose= require('mongoose')

const registrationSchema= mongoose.Schema({
    email:{
        type: String,
        require: true
    },
    username:{
        type: String,
        require: true
    },
    password:{
        type: String,
        require: true
    }
})
const Registration= mongoose.model('Registration',registrationSchema)
module.exports= Registration