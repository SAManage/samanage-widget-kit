import React from 'react'
import PropTypes from 'prop-types'
import classes from '../teamviewer/index.scss'

/*
  This component manages oauth authentication process
  it renders a button which opens the 3rd party login window
  and recieves the result of authentication - a oauth token
*/

export default class OAuthAuthenticator extends React.PureComponent {
  constructor (props) {
    super(props)
    this.credentials = null
    this.externalWindow = null
    this.state = { state: OAuthAuthenticator.NOT_AUTHENTICATED, credentials: null, externalWindow: false }
  }

  static propTypes = {
    client_id: PropTypes.string.isRequired,
    client_secret: PropTypes.string.isRequired
  }

  componentDidMount () {
    window.addEventListener('message', this.dispatchWidgetMessage, false)
  }

  componentWillUnmount () {
    window.removeEventListener('message', this.dispatchWidgetMessage, false)
  }

  dispatchWidgetMessage = (message) => {
    if (message.data.requestType === 'dispatchEventToWidgets') {
      this.onWidgetEvent(message.data.event)
    }
  }

  onWidgetEvent = (event) => {
    if (event.eventType === 'oauthRedirect') {
      this.getToken(event)
    }
  }

  onAuthStateChange = () => {
    if (this.props.on_state_change) {
      this.props.on_state_change({ state: this.state.state, credentials: this.state.credentials })
    }
  }

  getToken = (event) => {
    // Note: this whole function should be moved to server side (because of 'client_secret')
    const component = this
    try {
      const code = event.query_params.code
      const xhttp = new XMLHttpRequest()
      xhttp.onreadystatechange = function() {
        if (this.readyState === 4) {
          if (this.status === 200) {
            component.credentials = JSON.parse(this.responseText)
            component.setState({ state: OAuthAuthenticator.AUTHENTICATED, credentials: component.credentials }, component.onAuthStateChange)
          } else {
            component.credentials = null
            component.setState({ state: OAuthAuthenticator.AUTH_ERROR, credentials: null }, component.onAuthStateChange)
          }
        }
      }
      xhttp.open('POST', this.props.token_url, true)
      const post_data = platformWidgetHelper.toQueryString({
        grant_type: 'authorization_code',
        code,
        redirect_uri: `https://app.samanagestage.com${platformWidgetHelper.oauth.buildRedirectUrl()}`,
        client_id: this.props.client_id,
        client_secret: this.props.client_secret
      }).replace(/%20/g, '+')
      xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
      xhttp.send(post_data)
    } catch (e) {
      component.setState({ state: OAuthAuthenticator.AUTH_ERROR, credentials: null }, component.onAuthStateChange)
      console.error(e)
    }
  }

  closeExternalWindow = () => {
    if (this.externalWindow && !this.externalWindow.closed) this.externalWindow.close()
    this.externalWindow = null
    this.setState({ externalWindow: false })
  }

  focusExternalWindow = () => {
    if (this.externalWindow && !this.externalWindow.closed) {
      this.externalWindow.focus()
    } else {
      this.closeExternalWindow()
    }
  }

  openOAuthAuthenticator = () => {
    this.setState({ state: OAuthAuthenticator.AUTH_IN_PROGRESS })
    const redirect_uri = `https://app.samanagestage.com${platformWidgetHelper.oauth.buildRedirectUrl()}`
    const OAuthAuthenticator_url = this.props.authorization_url + platformWidgetHelper.toQueryString({
      response_type: 'code',
      client_id: this.props.client_id,
      redirect_uri,
      state: platformWidgetHelper.toQueryString({ closeWindow: true }),
      display: 'popup'
    })
    const left = (window.screen.width - 800) / 2
    const top = (window.screen.height - 600) / 2
    this.externalWindow = window.open(OAuthAuthenticator_url, '_blank',
      `height=600,width=800,status=yes,toolbar=no,menubar=no,location=no, chrome=yes, centerscreen, top=${top}, left=${left}`)
    const self = this
    this.externalWindow.onbeforeunload = function() {
      self.setState({ externalWindow: false })
      self.externalWindow = null
    }
    this.setState({ externalWindow: true })
  }

  render () {
    const { client_id, client_secret } = this.props
    const shouldDisableButton = client_secret.length === 0 || client_id.length === 0
    const Button = shouldDisableButton ? PlatformWidgetComponents.RegularButton : PlatformWidgetComponents.MainButton
    return (
      <div className={classes.buttons}>
        <Button onClick={this.state.externalWindow ? this.focusExternalWindow : this.openOAuthAuthenticator} className={classes.button}>
        Sign In
        </Button>
      </div>
    )
  }
}

OAuthAuthenticator.AUTH_IN_PROGRESS = 'in-progress'
OAuthAuthenticator.AUTHENTICATED = 'authenticated'
OAuthAuthenticator.AUTH_ERROR = 'error'
OAuthAuthenticator.NOT_AUTHENTICATED = 'not-authenticated'
