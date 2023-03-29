require("dotenv").config({ path: __dirname + "/.env" })
const express = require("express")
const cors = require("cors")
const helmet = require('helmet')
const httpProxy = require('http-proxy');
const HttpProxyRules = require('http-proxy-rules');




const app = express()
const server = require("http").Server(app)
const io = require("socket.io")(server, { cors: { origin: "*" } })
app.use(cors())
app.use(helmet())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


const frontend_url = process.env.FRONTEND_URL || "https://skillup-community.netlify.app"

const PORT = process.env.PORT || 4040
server.listen(PORT, () => console.log("Listening on port %d", PORT))

const proxyRules = new HttpProxyRules({
    rules: {
        '.*/events/*': `${frontend_url}/events`, // Rule (1) docs, about, etc
        '.*/my-courses/*': `${frontend_url}/my-courses`,
        '.*/opportunities/*': `${frontend_url}/opportunities`,
        '.*/resource/*': `${frontend_url}/resource`,
        '.*/library/*': `${frontend_url}/library`,
        '.*/settings/*': `${frontend_url}/settings`,
        '.*/blog/*': `${frontend_url}/blog`,
        '.*/courses/*': `${frontend_url}/courses`,

        '.*/forum': 'http://localhost:4567/forum', // Rule (2) forums
        '.*/forum/*': 'http://localhost:4567/forum', 
        '/forum/*': 'http://localhost:4567/forum',
        './forum/*': 'http://localhost:4567/forum',
        '/forum': 'http://localhost:4567/forum' 
    },
    default: `${frontend_url}` // default target, will be landing page
});

const proxy = httpProxy.createProxy();


//Middlewares

app.use((req, res, next) => {
    const target = proxyRules.match(req);
    if (target) {
      proxy.web(req, res, { target });
    } else {
      next();
    }
  });

// app.use(function(req,res,next){
//     try{
//         if (req.url.substr(0, 18).indexOf("socket.io")>-1){
//             //console.log("SOCKET.IO", req.url)
//             return proxy.web(req, res, { target: 'wss://localhost:4567', ws: true }, function(e) { 
//             //console.log('PROXY ERR',e)
//             });
//         } else {
//             var target = proxyRules.match(req);
//             if (target) {
//                 //console.log("TARGET", target, req.url)
//                 return proxy.web(req, res, {
//                     target: target
//                 }, function(e) { 
//                 //console.log('PROXY ERR',e)
//                 });
//             } else {
//                 res.sendStatus(404);
//             }
//         }
//     } catch(e){
//         res.sendStatus(500);
//     }
// });

app.get("/", (req, res) => {
  res.status(200).json({success: true, message: "Wow everything is working fine!"})
})

app.get("/test", (req, res) => {
  res.status(200).json({success: true, message: "Wow everything is working fine!"})
})





// Handle unhandled promise rejections and exceptions
process.on('unhandledRejection', (err) => {
  console.log(err.message)
  process.exit(1)
})

process.on('uncaughtException', (err) => {
  console.log(err.message)
  process.exit(1)
})

app.use((err, req, res, _next) => {
  res.status(400).json({ message: "Something went wrong", error: err.message })
})

app.use((err, res, next) => {
  return res.status(400).json({success:false, message: "route not found"})
})








// const options = {/*Put your TLS options here.*/};





// mainserver.listen(PORT, () => console.log("Listening on port %d", PORT))

// mainserver.on('error', function (error, req, res) {
//     let json;
//     console.log('proxy error', error);
//     if (!res.headersSent) {
//     res.writeHead(500, { 'content-type': 'application/json' });
//     }

//     json = { error: 'proxy_error', reason: error.message };
//     res.end(JSON.stringify(json));
// });








