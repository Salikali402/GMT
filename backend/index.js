const express= require('express')
const app= express()
const port=8080
const mongoose= require('mongoose')
const Registration= require('./models/Registration')
const Shared= require('./models/Shared')
const cors= require('cors')
const connection= require('./connection')
const userRouter= require('./routes/user')
const requireAuth= require('./middlewares/requireAuth')
const validator= require('validator')
const jwt= require('jsonwebtoken')
const bcrypt= require('bcrypt')
require('dotenv').config()

app.use(cors())
// middleware
app.use(express.json())
app.use(express.urlencoded({extended:true}))


connection(process.env.DB_URL).then(()=>{
    console.log('Connection successfull')
}).catch((err)=> console.log(err))

const createToken= (_id)=>{
    return jwt.sign({_id}, process.env.SECRET, {expiresIn:'3d'})
}

app.use('/user', userRouter)
app.post('/register', async(req,res)=>{
    try{
        let {name,email,number,password}= req.body
        
        if(!email){
            return res.status(400).send("All fields required")
        }
        if(!validator.isEmail(email)){
            return res.status(400).send("Email is not valid")
        }
        if(!validator.isStrongPassword(password)){
            return res.status(400).send("Password is too weak.\n Smaller than 8 digit\n Use atleast 1 capital letter, special symbol and number")
        }

        const exist= await Registration.findOne({email})
        
        if(exist){
            return res.status(400).send("Email already in use")
        }
        else{
            const salt = await bcrypt.genSalt(10);
            const hash= await bcrypt.hash(password, salt)
            const user= await Registration.create({name,email,number,password:hash})
            const token= createToken(user._id)
            res.status(200).json({msg:"OK", token:token});
        }
    }
    catch(err){
        console.log(err);
        res.status(500).json({ message: 'An error occurred', error: err.message })
    }
})
app.post('/login', async(req,res)=>{
    let {email, password}= req.body
    try{
        if(!email || !password){
            res.status(401).json({ message: 'All fields required'})
        }
        const user= await Registration.findOne({email})
        
        if(!user){
           return res.status(401).json({ message: 'Incorrect email'})
        }
        const match= await bcrypt.compare(password, user.password)
        if(!match){
            return res.status(401).json({ message: 'Incorrect password'})
        }
        else{
            const token= createToken(user._id)
            return res.status(200).json({email:user.email, token: token})
        }
    }
    catch(err){
        console.log("Error==>>  ",err);
        res.status(500).json({ message: 'An error occurred', error: err.message })
    }
})

app.use(requireAuth)
// Route to handle sharing
app.post('/api/share', async (req, res) => {
  try {
    const { speed } = req.body;
    const newConfig = new Shared({ speed });
    await newConfig.save();
    res.json({ sharedId: newConfig._id });
  } catch (error) {
    res.status(500).json({ error: 'Error saving configuration' });
  }
});

// Route to retrieve configuration by ID
app.get('/api/shared/:id', async (req, res) => {
  try {
    const config = await Shared.findById(req.params.id);
    if (config) {
      res.json(config);
    } else {
      res.status(404).json({ error: 'Configuration not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error fetching configuration' });
  }
});


app.listen(port, ()=>{
    console.log(`Server is running on ${port}`);
})
