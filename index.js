const fs = require("fs");
const http = require("http");
const url = require("url");

const slugify = require("slugify");

const replaceTemplate = require("./modules/replaceTemplate");

/////////////////////////////////////////////////////////////////
//Files
//Blocking,synchronous way
//const input = fs.readFileSync("./txt/input.txt", "utf-8");
//console.log(input);
//const textOut = `This is what we know about the avocado: ${input}.\nCreated on ${Date.now()}`;
//fs.writeFileSync(".txt/output.txt", textOut);
//console.log("File written");

//Non Blocking ,synchronous way
/* fs.readFile("./txt/start.txt", "utf-8", (err, data1) => {
  if (err) return console.log("ERROR!");

  fs.readFile(`./txt/${data1}.txt`, "utf-8", (err, data2) => {
    console.log(data2);
    fs.readFile("./txt/append.txt", "utf-8", (err, data3) => {
      console.log(data3);
      fs.writeFile("./txt/final.txt", `${data2}\n${data3}`, "utf-8", (err) => {
        console.log("Your file has been written");
      });
    });
  });
});
console.log("Will read file!"); */
/////////////////////////////////////////////////////////
//SERVER
//synchronous version->blocks the code execution but not a problem here
//reading the file synchronously

//overview
const tempOverview = fs.readFileSync(
  `${__dirname}/templates/template-overview.html`,
  "utf-8"
);
//product
const tempProduct = fs.readFileSync(
  `${__dirname}/templates/template-product.html`,
  "utf-8"
);
//card
const tempCard = fs.readFileSync(
  `${__dirname}/templates/template-card.html`,
  "utf-8"
);

const data = fs.readFileSync(
  `${__dirname}/dev-data/data.json`,
  "utf-8"
  //(err,data)=>callback function
);
const dataObject = JSON.parse(data);

const slugs = dataObject.map((el) => slugify(el.productName, { lower: true }));
console.log(slugs);

const server = http.createServer((req, res) => {
  const { query, pathname } = url.parse(req.url, true);

  //Overview page
  if (pathname === "/" || pathname === "/overview") {
    res.writeHead(200, { "Content-type": "text/html" });

    const cardsHTML = dataObject
      .map((el) => replaceTemplate(tempCard, el))
      .join(""); //we use map to return something
    const output = tempOverview.replace("{%PRODUCT_CARDS%}", cardsHTML);

    res.end(output); //sending response to the client

    //Product Page
  } else if (pathname === "/product") {
    res.writeHead(200, { "Content-type": "text/html" });
    const product = dataObject[query.id];
    const output = replaceTemplate(tempProduct, product);

    res.end(output);
  }

  //API
  else if (pathname === "/api") {
    //sending the object as a response
    res.writeHead(200, { "Content-type": "application/json" });
    res.end(data);

    //Not found
  } else {
    res.writeHead(404, {
      "Content-type": "text/html", //sending header
      "my-own-header": "hello-world",
    }); //Generating the error 404
    res.end("<h1>Page Not Found!</h1>");
  }
}); //It'll accept a callback function
//Incoming request
server.listen(7000, "127.0.0.1", () => {
  console.log("Listening to requests on port 8000");
});
//An api is a service from which we can request data
