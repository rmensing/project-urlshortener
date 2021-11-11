require('dotenv').config();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const app = express();
var validUrl = require('valid-url');
var { customAlphabet } = require("nanoid");
const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', 5)

const Schema = mongoose.Schema;

const urlSchema = new Schema({
  origURL: { type: String, required: true },
  shortURL: { type: String, required: true },
});

 const Url = mongoose.model('Url', urlSchema);

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

var urlencodedParser = bodyParser.urlencoded({ extended: false })

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', urlencodedParser, async (req, res) => {
  var url_input = req.body.url;
  console.log(url_input);
  var short_code = nanoid();
  console.log(short_code);

  if (!validUrl.isWebUri(url_input)) {
    console.log("Invalid URL.");
    res.status(401).json({
      error: 'invalid URL'
    })
  } else {
    var lookup = await Url.findOne({
        origURL: url_input
      })
      console.log("55-lookup: " + lookup);
      if (lookup) {
        res.json({
          origURL: lookup.origURL,
          shortURL: lookup.shortURL
        })
      } else {
        console.log("62-New:" + url_input + " -- " + short_code );
        lookup = new Url({
          origURL: url_input,
          shortURL: short_code
        })
        console.log("67-lookup: " + lookup);
        await lookup.save()
        res.json({
          origURL: lookup.origURL,
          shortURL: lookup.shortURL
        })
      }
  }
})

app.get("/api/shorturl/:short_url?", async (req, res) => {
      const urlParams = await Url.findOne({
      short_url: req.params.shortURL
    })
    if (urlParams) {
      return res.redirect(urlParams.origURL)
    } else {
      return res.status(404).json('No URL found')
    }
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
