require('./common')
require('./images/logo.png')
require('./images/radar_legend.png')
require('./analytics.js')

const Factory = require('./util/factory')

if (process.env.SHEET_ID) {
  Factory().build(process.env.SHEET_ID, process.env.SHEET_NAME)
} else {
  const QueryParams = require('./util/queryParamProcessor')

  var queryString = window.location.href.match(/documentId(.*)/)
  var queryParams = queryString ? QueryParams(queryString[0]) : {}

  Factory().build(queryParams.documentId, queryParams.sheetName)
}
