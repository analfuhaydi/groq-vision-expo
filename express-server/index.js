const express = require("express");
const app = express();
const port = 3000; // You can choose any available port

// Define a route for the root URL ('/')
app.get("/", (req, res) => {
  res.send("Hello, World!");
});

// Start the server
app.listen(port, () => {
  console.log(
    `Express.js Hello World app listening at http://localhost:${port}`
  );
});
