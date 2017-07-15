const express = require('express')
const app = express()

app.get('/getOdds', function(req, res){
  console.log('gettingOdds')
  res.send('gotOdds')
})

app.listen(3000, function(){
  console.log('starting server on port 3000')
})
