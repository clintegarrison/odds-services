const express = require('express')
const app = express()
const fetchUrl = require('fetch').fetchUrl

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
  //res.send(moneyLineMatchups)
})

app.listen(3000, function(){
  console.log('starting server on port 3000')


})

function getTeamName(data){
  var teamName = data.substring(data.indexOf('<a'))
  teamName = teamName.substring(teamName.indexOf('>'))
  teamName = teamName.substring(1, teamName.indexOf('<'))
  return teamName
}
