const SamanageAPI = require('samanage-api')
const fs = require('fs-extra')
const webpack_config = require('../webpack/webpack.dev.config.js')
const weblog = require('webpack-log');
const log = weblog({ name: 'widget-commands', level: 'info' }) // webpack-dev-server
const configFile = './widget-server-config.json'
SamanageAPI.debug = true
SamanageAPI.log = log.debug
 
const parsedArgs = {
  command: process.argv[2],
  widget: process.argv[3]
}

log.info(`==== widget-commands ${parsedArgs.command} ${parsedArgs.widget} ====`)

try {
  var all_config = require(configFile)
} catch (e) {
  log.error('Not a valid JSON in: ', configFile)
  process.exit(1)
}

const config = all_config.dev

if (!parsedArgs.command) {
  log.info('widget-commands.js usage:')
  log.info(`create-widget [widget-name]`)
  log.info(`update-widget [widget-name]`)
  log.info(`deploy-widget [widget-name]`)
  process.exit(0)
}
else if (!parsedArgs.widget) {
  log.error(`Widget parameter is missing`)
  process.exit(1)
} else if (!config.widgets[parsedArgs.widget]) {
  log.error(`Widget '${parsedArgs.widget}' is not configured in ${configFile}`)
  process.exit(1)
} else if (!(config.token = config.token || process.env.TOKEN)) {
  log.error('API token not set. Use "export TOKEN=<my-API-token>"')
  process.exit(1)
} else if (webpack_config.devServer.https && !config.origin.match('https')) {
  log.error('Webpack server is configured for https, but widget origin is http')
  process.exit(1)
} else if (!webpack_config.devServer.https && config.origin.match('https')) {
  log.error('Webpack server is configured for http, but widget origin is https')
  process.exit(1)
}

const samanage = new SamanageAPI.Connection(config.token, config.origin)

const widgetDevUrl = widget => `${webpack_config.devServer.https ? 'https' : 'http'}://localhost:${webpack_config.devServer.port}`
const widgetProdUrl = widget => `/platform_widgets/${widget}/index.html`

function createOrUpdateWidget(widget, prod) {
  const create_widget = SamanageAPI.create('platform_widget', 'admin')
  const widgetConfig = config.widgets[parsedArgs.widget]
  const create_widget_request = create_widget(
    Object.assign({}, 
      widgetConfig, {
        code: (prod ? widgetProdUrl(widget) : widgetDevUrl(widget)),
        name: (prod ? `${widgetConfig.name}-prod` : widgetConfig.name)
      }
    )
  )
  samanage.callSamanageAPI(create_widget_request).then(
    ({ data }) => {
      log.info('Success', data)
    }
  ).catch(
    (error) => {
      log.error('Error ', error)
    }
  )
}

if (parsedArgs.command == 'create-widget' || parsedArgs.command == 'update-widget') {
  createOrUpdateWidget(parsedArgs.widget)
}
else if (parsedArgs.command == 'deploy-widget') {
  const targetDir = '../Frontend/public/platform_widgets'
  let targetDirExists = false
  try {
    targetDirExists = fs.statSync(targetDir).isDirectory()
  }
  finally {
    if (!targetDirExists) {
      log.error(`target folder '${targetDir}' does not exist`)
      process.exit(1)
    }
  }
  log.info(`cp ./dist/${parsedArgs.widget} -> ${targetDir}/${parsedArgs.widget}`)
  fs.copySync(`./dist/${parsedArgs.widget}`, `${targetDir}/${parsedArgs.widget}`)
  createOrUpdateWidget(parsedArgs.widget, true)
}
else {
  log.error(`Unknown command '${parsedArgs.command}'`)
  process.exit(1)
}
