const express = require('express');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const { createProxyMiddleware, responseInterceptor } = require('http-proxy-middleware');
require('dotenv').config();

const app = express();

const PORT = process.env.PORT;
const HOST = process.env.HOST;
const API_BASE_URL = process.env.API_BASE_URL;
const API_SERVICE_URL = `${API_BASE_URL}/users`;
const PASTA = "/contanova";
var actualOp = "empty";

app.use(morgan('dev'));

app.use('/todos', createProxyMiddleware({
    selfHandleResponse: true,
    target: API_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
        "^/todos": "",
    },
    onProxyReq: function onProxyReq(proxyReq, req, res) {
        actualOp = proxyReq.getHeader("op");
        //salvaConta();
      },
      onProxyRes: responseInterceptor(async (responseBuffer, proxyRes, req, res) => {
        const response = responseBuffer.toString('utf8'); // convert buffer to string
        var json = JSON.parse(response);
       // console.log(json[2]);
       saveOp(response, actualOp);
        return response; // manipulate response and return the result
      }),
}));

function salvaConta() {
    if(!fs.existsSync(PASTA)) {
        fs.mkdir(path.join(__dirname, PASTA), (err) => {
            if (err) {
                console.log(`Deu ruim... ${err.message}`);
                return
            }
    
            console.log("Diretório criado! =)")
        });
    } else {
        console.log("pasta já existe");
    }
}

function saveOp(response = "", op = "err") {
    fs.writeFile(`${path.dirname(__dirname)}${PASTA}/${op}.json`, response, function (err){
        if(err) {
            console.log(`Deu ruim arquivo... ${err.message}`);
        } else {
            console.log("arquivo criado");
        }
    });
}

app.listen(PORT, HOST, ()=> {
    console.log(`Starting proxy at ${HOST}:${PORT}`);
});