const express = require('express')
const app = express()
const fetchUrl = require('fetch').fetchUrl

app.all('*', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.get('/getMoneyLines', function(req, res){
  console.log('gettingMoneyLines')
  var moneyLineMatchups = []
  fetchUrl('http://www.vegasinsider.com/college-football/odds/las-vegas/money/', function(error, meta, body){
    // console.log(body.toString())
    var bodyString = body.toString()
    var startPosition = bodyString.indexOf("frodds-data-tbl")
    var tableStartAndAll = bodyString.substring(startPosition)

    var tableStartAndEnd = tableStartAndAll.substring(0,tableStartAndAll.indexOf('</table>'))

    var arraySplitOnTr = tableStartAndEnd.split('<tr>')

    for(i=1; i<arraySplitOnTr.length; i++ ){
      // console.log('-----working START')
      // console.log(arraySplitOnTr[i])
      // console.log('-----working END')

      //teams
      var arraySplintOnTd = arraySplitOnTr[i].split('</td>')

      if(arraySplintOnTd.length > 2){
        //team one
        var teamOneMess = arraySplintOnTd[0].substring(0,arraySplintOnTd[0].indexOf('</a>') + 4)
        var teamOneName = getTeamName(teamOneMess)

        //team two
        var teamTwoMess = arraySplintOnTd[0].substring(arraySplintOnTd[0].indexOf('</a>') + 4)
        var teamTwoName = getTeamName(teamTwoMess)

        //consensus money line
        //console.log(arraySplintOnTd[2])
        var moneLineBrPosition = arraySplintOnTd[2].indexOf('<br>')
        var moneyLineTeamOneValue= arraySplintOnTd[2].substring(moneLineBrPosition + 4, moneLineBrPosition + 8)
        var moneyLineTeamTwoValue = arraySplintOnTd[2].substring(moneLineBrPosition + 12, moneLineBrPosition + 16)

        var matchup = {
          teamOne: teamOneName,
          teamTwo: teamTwoName,
          moneyLineTeamOne: moneyLineTeamOneValue,
          moneyLineTeamTwo: moneyLineTeamTwoValue
        }

        moneyLineMatchups.push(matchup)
      }
    }
    res.send(moneyLineMatchups)
  })
  // what to do if service call fails
})

app.get('/getSpreads', function(req, res){
  console.log('getSpreads')
  var moneyLineMatchups = []
  fetchUrl('http://www.vegasinsider.com/college-football/odds/las-vegas/', function(error, meta, body){
    // console.log(body.toString())
    var bodyString = body.toString()
    var startPosition = bodyString.indexOf("frodds-data-tbl")
    var tableStartAndAll = bodyString.substring(startPosition)

    var tableStartAndEnd = tableStartAndAll.substring(0,tableStartAndAll.indexOf('</table>'))

    var arraySplitOnTr = tableStartAndEnd.split('<tr>')

    for(i=1; i<arraySplitOnTr.length; i++ ){
      // console.log('-----working START')
      //console.log(arraySplitOnTr[i])
      // console.log('-----working END')

      //teams
      var arraySplintOnTd = arraySplitOnTr[i].split('</td>')

      if(arraySplintOnTd.length > 2){
        //team one
        var teamOneMess = arraySplintOnTd[0].substring(0,arraySplintOnTd[0].indexOf('</a>') + 4)
        var teamOneName = getTeamName(teamOneMess)

        //team two
        var teamTwoMess = arraySplintOnTd[0].substring(arraySplintOnTd[0].indexOf('</a>') + 4)
        var teamTwoName = getTeamName(teamTwoMess)

        //consensus spread
        var startAposition = arraySplintOnTd[2].indexOf('<a')
        var spreadMess= arraySplintOnTd[2].substring(startAposition)
        var endAposition = spreadMess.indexOf('<br>')
        spreadMess = spreadMess.substring(endAposition)
        var endATagPosition = spreadMess.indexOf('</a>')
        spreadMess = spreadMess.substring(4, endATagPosition)

        var spreads = getSpreads(spreadMess)

        var matchup = {
          teamOne: teamOneName,
          teamTwo: teamTwoName,
          spreadTeamOne: spreads.firstTeamSpread,
          spreadTeamTwo: spreads.secondTeamSpread
        }

        moneyLineMatchups.push(matchup)
      }
    }
    res.send(moneyLineMatchups)
  })
  // what to do if service call fails
})

app.listen(process.env.PORT || 9090, function(){
  console.log('starting server on port 3000')
})

function getTeamName(data){
  var teamName = data.substring(data.indexOf('<a'))
  teamName = teamName.substring(teamName.indexOf('>'))
  teamName = teamName.substring(1, teamName.indexOf('<'))
  return teamName
}

function getSpreads(spreadMess){
  console.log(spreadMess)
  var spreads = {firstTeamSpread:0,secondTeamSpread:0}

  var firstCharAfterBr = spreadMess.substring(0,1)

  if(firstCharAfterBr==='-'){
    var colPosition = spreadMess.indexOf(';')
    var firstTeamSpread = spreadMess.substring(0,colPosition)
    var andPosition = firstTeamSpread.indexOf('&')
    var letterAfterAnd = firstTeamSpread.substring(andPosition+1, andPosition+2)
    if(letterAfterAnd==='n'){
      firstTeamSpread = firstTeamSpread.substring(0, andPosition)
    }
    firstTeamSpread = firstTeamSpread.replace('&frac12','.5')
    firstTeamSpread = firstTeamSpread.replace('&nbsp','')

    spreads.firstTeamSpread = firstTeamSpread;
    spreads.secondTeamSpread = firstTeamSpread.replace('-','+')
  }else{
    var brPosition = spreadMess.indexOf('<br>')
    var secondTeamSpread = spreadMess.substring(brPosition)
    var colPosition = secondTeamSpread.indexOf(';')
    secondTeamSpread = secondTeamSpread.substring(4,colPosition)
    var letterAfterAnd = secondTeamSpread.substring(andPosition+1, andPosition+2)
    if(letterAfterAnd==='n'){
      secondTeamSpread = secondTeamSpread.substring(0, andPosition)
    }
    secondTeamSpread = secondTeamSpread.replace('&frac12','.5')
    secondTeamSpread = secondTeamSpread.replace('&nbsp','')

    spreads.secondTeamSpread = secondTeamSpread
    spreads.firstTeamSpread = secondTeamSpread.replace('-','+')
  }

  return spreads;
}
