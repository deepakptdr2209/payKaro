const express = require('express');
const zod = require('zod')
const { User,Account } = require("../db");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");
const {authMiddleware} = require('../middleware');
const router = express.Router();

// input validation using zod
const signUpValidation = zod.object({
    username : zod.string().email(),
    firstName: zod.string(),
	lastName: zod.string(),
	password: zod.string().min(6)
});
const signInValidation = zod.object({
    username : zod.string().email(),
    password : zod.string().min(6)
});

const updateUserValidation = zod.object({
    firstName:zod.string().optional(),
    lastName: zod.string().optional(),
    password: zod.string().min(6).optional()
})

// !-----------SIGNUP ROUTER ------------!
router.post('/signup',async (req,res)=>{
    const {success} = signUpValidation.safeParse(req.body);
    if (!success) {
        return res.status(411).json({
            message: "Email already taken / Incorrect inputs"
        })
    } 
    const existingUser = await User.findOne({
        username : req.body.username
    });
    if(existingUser){
        return res.status(411).json({
            message: "Email already taken: Login Now"
        })
    }
    const user = await User.create({
        username: req.body.username,
        password: req.body.password,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
    });
    const userId = user._id;
    	// ----- Create new account ------

        await Account.create({
            userId,
            balance: 1 + Math.random() * 10000
        })

    // generate jwt Token
    const token =  jwt.sign({userId},JWT_SECRET);
    res.json({
        message: "User created successfully",
        token: token
    });


});

// !-----------SIGNIN ROUTER ------------!
router.post('/signin',async (req,res)=>{
   const {success } = signInValidation.safeParse(req.body);
   if(!success){
    return res.status
    (411).json({
        message: " Incorrect inputs"
    })
   }  

   const user = await User.findOne({
    username: req.body.username,
    password : req.body.password
   });
   if (user) {
    const token = jwt.sign({
        userId: user._id
    }, JWT_SECRET);

    res.json({
        token: token
    })
    return;
}
res.status(411).json({
    message: "Error while logging in"
})
});

// !---------------UPDATE USER ROUTER ----------!
 router.put('/',authMiddleware,async (req,res)=>{
   const {success} = updateUserValidation.safeParse.req.body;
   if(!success){
    return res.status(411).json({
     message : "Incorrect inputs"
    })
   };
   await User.updateOne({_id :req.userId},req.body);
   res.json({
    message: "Updated successfully"
    })
 });

 // !------------GET BULK USER -----------!
 router.get("/bulk", async (req, res) => {
    const filter = req.query.filter || "";

    const users = await User.find({
        $or: [{
            firstName: {
                "$regex": filter
            }
        }, {
            lastName: {
                "$regex": filter
            }
        }]
    })

    res.json({
        user: users.map(user => ({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            _id: user._id
        }))
    })
})

module.exports = router;