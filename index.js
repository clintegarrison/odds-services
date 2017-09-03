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
        //game time
        var gameTime = arraySplintOnTd[0].substring(arraySplintOnTd[0].indexOf('cellTextHot') + 13, arraySplintOnTd[0].length)
        gameTime = gameTime.substring(0, gameTime.indexOf('<'))

        //team one
        var teamOneMess = arraySplintOnTd[0].substring(0,arraySplintOnTd[0].indexOf('</a>') + 4)
        var teamOneName = getTeamName(teamOneMess)

        //team two
        var teamTwoMess = arraySplintOnTd[0].substring(arraySplintOnTd[0].indexOf('</a>') + 4)
        var teamTwoName = getTeamName(teamTwoMess)

        //consensus money line

        var moneLineBrPosition = arraySplintOnTd[2].indexOf('<br>')
        var moneyLineTeamOneValue= arraySplintOnTd[2].substring(moneLineBrPosition + 4)
        moneyLineTeamOneValue = moneyLineTeamOneValue.substring(0, moneyLineTeamOneValue.indexOf('<')).trim()

        var plusOrMinusPosition = moneyLineTeamOneValue.indexOf('+')
        if(plusOrMinusPosition<0){
          plusOrMinusPosition = moneyLineTeamOneValue.indexOf('-')
        }
        if(plusOrMinusPosition>0){
          moneyLineTeamOneValue = moneyLineTeamOneValue.substring(plusOrMinusPosition, moneyLineTeamOneValue.length)
        }

        var moneyLineTeamTwoValue = arraySplintOnTd[2].substring(moneLineBrPosition + 12)
        moneyLineTeamTwoValue = moneyLineTeamTwoValue.substring(0, moneyLineTeamTwoValue.indexOf('<')).trim()
        moneyLineTeamTwoValue = moneyLineTeamTwoValue.replace('>','')
        moneyLineTeamTwoValue = moneyLineTeamTwoValue.replace('r','')
        plusOrMinusPosition = moneyLineTeamTwoValue.indexOf('+')
        if(plusOrMinusPosition<0){
          plusOrMinusPosition = moneyLineTeamTwoValue.indexOf('-')
        }
        if(plusOrMinusPosition>0){
          moneyLineTeamTwoValue = moneyLineTeamTwoValue.substring(plusOrMinusPosition, moneyLineTeamTwoValue.length)
        }

        var matchup = {
          gameTime: gameTime,
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
        //game time
        var gameTime = arraySplintOnTd[0].substring(arraySplintOnTd[0].indexOf('cellTextHot') + 13, arraySplintOnTd[0].length)
        gameTime = gameTime.substring(0, gameTime.indexOf('<'))

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
          gameTime: gameTime,
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

app.get('/getTotals', function(req, res){
  console.log('getTotals')
  var totalsArr = []
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
        //game time
        var gameTime = arraySplintOnTd[0].substring(arraySplintOnTd[0].indexOf('cellTextHot') + 13, arraySplintOnTd[0].length)
        gameTime = gameTime.substring(0, gameTime.indexOf('<'))

        //team one
        var teamOneMess = arraySplintOnTd[0].substring(0,arraySplintOnTd[0].indexOf('</a>') + 4)
        var teamOneName = getTeamName(teamOneMess)

        //team two
        var teamTwoMess = arraySplintOnTd[0].substring(arraySplintOnTd[0].indexOf('</a>') + 4)
        var teamTwoName = getTeamName(teamTwoMess)

        //consensus spread
        var startAposition = arraySplintOnTd[2].indexOf('<a')
        var totalsMess= arraySplintOnTd[2].substring(startAposition)
        var endAposition = totalsMess.indexOf('<br>')
        totalsMess = totalsMess.substring(endAposition)
        var endATagPosition = totalsMess.indexOf('</a>')
        totalsMess = totalsMess.substring(4, endATagPosition)

        var totals = getTotals(totalsMess)

        var matchup = {
          gameTime: gameTime,
          teamOne: teamOneName,
          teamTwo: teamTwoName,
          totalPoints: totals
        }

        totalsArr.push(matchup)
      }
    }
    res.send(totalsArr)
  })
  // what to do if service call fails
})

app.get('/getScores', function(req, res){
  var moneyLineMatchups = []
  fetchUrl('http://www.vegasinsider.com/college-football/scoreboard/', function(error, meta, body){
    var bodyString = body.toString()
    var startPosition = bodyString.indexOf('SLTables4')
    bodyString = bodyString.substring(startPosition - 13, bodyString.length)
    var endDivPosition = bodyString.indexOf('</div>')

    bodyString = bodyString.substring(0, endDivPosition + 6)

    var games = bodyString.split('/graphics/component_shadow2.gif')

    var gamesArray = []

    for(var i=0; i<games.length; i++){
      var gameChunk = games[i]
      var teamUrlPos = games[i].indexOf('team-page')
      gameChunk = gameChunk.substring(teamUrlPos, gameChunk.length)
      var closeBracketPos = gameChunk.indexOf('>')
      var openBracketPos = gameChunk.indexOf('<')
      var teamOne = gameChunk.substring(closeBracketPos + 1, openBracketPos)

      gameChunk = games[i].substring(games[i].indexOf(teamOne), games[i].length)
      teamUrlPos = gameChunk.indexOf('team-page')
      gameChunk = gameChunk.substring(teamUrlPos, gameChunk.length)
      closeBracketPos = gameChunk.indexOf('>')
      openBracketPos = gameChunk.indexOf('<')
      var teamTwo = gameChunk.substring(closeBracketPos + 1, openBracketPos)

      gameChunk = games[i]
      var titlePos = gameChunk.indexOf('<span class="sub_title_red">')
      gameChunk = gameChunk.substring(titlePos + 28, gameChunk.length)
      var spanEndPos = gameChunk.indexOf('</span>')
      var gameState = gameChunk.substring(0, spanEndPos).trim()

      gameChunk = games[i]
      var teamOneTotalPos = gameChunk.indexOf('<font color="#b20000"><B> &nbsp;')
      gameChunk = gameChunk.substring(teamOneTotalPos, gameChunk.length)
      var bOpenPos = gameChunk.indexOf('<B>')
      var bClosePos = gameChunk.indexOf('</B>')
      var teamOneScore = gameChunk.substring(bOpenPos + 3, bClosePos)
      teamOneScore = teamOneScore.replace('&nbsp;','').trim()
      teamOneScore = teamOneScore.replace('&nbsp;','').trim()

      gameChunk = games[i].substring(teamOneTotalPos + 25, games[i].length)
      var teamTwoTotalPos = gameChunk.indexOf('<font color="#b20000"><B> ')
      gameChunk = gameChunk.substring(teamTwoTotalPos, gameChunk.length)
      var bOpenPos = gameChunk.indexOf('<B>')
      var bClosePos = gameChunk.indexOf('</B>')
      var teamTwoScore = gameChunk.substring(bOpenPos + 3, bClosePos)
      teamTwoScore = teamTwoScore.replace('&nbsp;','').trim()
      teamTwoScore = teamTwoScore.replace('&nbsp;','').trim()

      var winner = ''

      if(isNaN(teamOneScore) || isNaN(teamTwoScore)){
        teamOneScore=''
        teamTwoScore=''
      }else{
        if(parseInt(teamOneScore) > parseInt(teamTwoScore)){
          winner = teamOne
        }else{
          winner = teamTwo
        }
      }

      var game = {
        teamOne: teamOne,
        teamTwo: teamTwo,
        teamOneScore: teamOneScore,
        teamTwoScore: teamTwoScore,
        gameState: gameState,
        winner: winner
      }

      gamesArray.push(game)
    }

    res.send(gamesArray)
  })
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

function getTotals(totalsMess){
  // console.log(totalsMess)
  var totalPoints = ''
  var uPosition = totalsMess.indexOf('u')
  if(uPosition>-1){
    if(uPosition-3 > -1 && !isNaN(totalsMess.charAt(uPosition-3))){
      totalPoints = totalsMess.substring(uPosition-3, uPosition)
    }else{
      totalPoints = totalsMess.substring(uPosition-2, uPosition)
    }

    if(totalPoints=='12;'){
      totalPoints = totalsMess.substring(uPosition-10, uPosition -1)
      totalPoints = totalPoints.replace('&frac12','.5')
      //console.log('@@@@', totalPoints)
    }
  }

  return totalPoints
}

function getSpreads(spreadMess){
  // console.log(spreadMess)
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
