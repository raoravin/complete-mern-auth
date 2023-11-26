require("./config/database").connect()
const express = require("express")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")


//import model - User
const User = require("./models/user.schema")


const app = express()
app.use(express.json())
app.use(express.urlencoded({extended:true}))


app.get("/", (req,res) => {
    res.send("Hello auth system")
})

app.post("/register", async (req, res) => {
    try {
        //collect all information
        const {firstname,lastname,email,password} = req.body
        // validate the data, if exists
        if(!(email && password && lastname && firstname)){
            res.status(401).send("All fields are required")
        }

        //check if user exists or note
        const existingUser = await User.findOne({email:email})

        if(existingUser) {
            res.status(401).send("User already exists")
        }

        // encrypt the password
        const myEncryptPassword = await bcrypt.hash(password,10)

        //create a new entry in database
        //user has excess to id
        const user = await User.create({
            firstname, //fistname:fistname (both keys same so can use one)
            lastname,
            email,
            password:myEncryptPassword
        })


        //create a token and send to user
        const token = jwt.sign({
            id: user._id, email:email
        },'shhhhh',{expiresIn:'2h'})


        //token not going to database but at frontend
        user.token = token
        //don't want to send the password to user
        user.password = undefined

        res.status(201).json(user)

    } catch (error) {
        console.log(error);
        console.log("Error in response route");
    }
})


app.post("/login", async(req, res) => {
    try {
        //collect information from frontend
        const {email,password} = req.body
        //validate
        if(!(email && password)){
            res.status(401).send("email and password required")
        }

        //check user in database
        const user = await User.findOne({email:email})
        // if user does not exists
        if (!user) {
            res.send("user don't exists in database")
        }

        //match the password
        if (user && (await bcrypt.compare(password, user.password))){

            //create token and send
           const token = jwt.sign({id:user.id,email}, 'shhhhh',{expiresIn:'2h'})

           //this what u gonna send at user side
           user.password = undefined
           user.token = token

           const options ={
            expires: new Date(Data.now() + 3 *24*60*60*1000),
            httpOnly: true
           }

           res.send(200).cookie("token", token,options).json({
            success: true,
            token,
            user
           })
        }

        
        
    } catch (error) {
        console.log(error);
        res.sendStatus(400).send("email or password is incorrect")
    }
})