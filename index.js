const express = require('express');
const app = express();

const port = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.send('Website is running');
  })
  
  app.listen(port, () => {
    console.log(`Website is listening at http://localhost:${port}`);
  })