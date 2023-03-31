require("dotenv").config({ path: __dirname + "/.env" })
const fs = require("fs")
const tls = require('tls')
const https = require('https')
const express = require("express")
const cors = require("cors")
const helmet = require('helmet')
const httpProxy = require('http-proxy');
const HttpProxyRules = require('http-proxy-rules');

const app = express()

const frontend_url = process.env.FRONTEND_URL || "https://skillup-community.netlify.app"

// const options = {
//     key: fs.readFileSync('key.pem'),
//     cert: fs.readFileSync("cert.pem"),
//     passphrase: "myforumsshkey"
// };

const server = https.createServer(app) // initialize server here

const io = require("socket.io")(server, { cors: { origin: "*" } }) // io can now access server

app.use(cors())
app.use(helmet())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

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








