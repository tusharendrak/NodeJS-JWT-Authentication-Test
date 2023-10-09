const express=require('express');
const app=express();

const jwt=require('jsonwebtoken');
const { expressjwt: exjwt } = require('express-jwt');

const bodyParser=require('body-parser');
const path=require('path');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

app.use((req,res,next)=>{
    res.setHeader('Access-Control-Allow-Origin','http://localhost:3000');
    res.setHeader('Access-Control-Allow-Headers','Content-type,Authorization');
    next();
});
const PORT=3000;


const secretKey='My super secret key';

const jwtMW = exjwt({
    secret: secretKey,
    algorithms: ['HS256']
});

let users = [
    {
        id: 1,
        username: 'Tushar',
        password: '123'
    },
    {
        id: 2,
        username: 'Koka',
        password: '123'

    }
];

app.post('/api/login',(req,res)=>{
    const {username,password}=req.body;

    let token;
    for(let user of users)
    {
        if(username == user.username && password==user.password)
        {
            //In the NodeJS, change the JWT expire to 3 minutes
            token=jwt.sign({ id: user.id, username: user.username}, secretKey ,{expiresIn: '180s'});
            break;
        }

    }
    if(token)
    {
        res.json({
            success: true,
            err: null,
            token
        });

    }else{
        res.status(401).json({
            success: false,
            err: 'Username and Password is incorrect',
            token: null
        });
    }

});


app.get('/api/dashboard', jwtMW , (req,res) => {
    res.json({
        success:true,
        content: "Dashboard content that only logged in people can see."
    })
})

//Create 1 more route (called settings) and protect this route with the JWT solution
app.get('/api/settings', jwtMW , (req, res) => {
    res.json({
        success: true,
        content: 'Settings content that only logged in people can see.'
    });
});

app.get('/', (req,res) => {
    res.sendFile(path.join(__dirname, 'index.html'))
});

app.use(function(err,req,res,next){

    if(err.name==='UnauthorizedError')
    {
        res.status(401).json({
            success:false,
            officialError:err,
            err:'Username and Password is incorrect 2'
        });
    }
    else{
        next(err);
    }

});

app.listen(PORT,()=>{

    console.log(`Serving on port ${PORT}`);
});