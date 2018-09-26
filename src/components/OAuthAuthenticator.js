import React from 'react'
import PropTypes from 'prop-types'

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
    onStateChange: PropTypes.func,
    clientId: PropTypes.string.isRequired,
    clientSecret: PropTypes.string.isRequired,
    tokenUrl: PropTypes.string.isRequired,
    authorizationUrl: PropTypes.string.isRequired,
    className: PropTypes.string
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
    const { state, credentials } = this.state
    const { onStateChange } = this.props
    if (onStateChange) {
      onStateChange({ state, credentials })
    }
  }

  getToken = (event) => {
    const { tokenUrl, clientId, clientSecret } = this.props
    // Note: this whole function should be moved to server side (because of 'client_secret')
    const component = this
    try {
      const code = event.query_params.code
      const xhttp = new XMLHttpRequest()
      xhttp.onreadystatechange = function() { // eslint-disable-line
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
      xhttp.open('POST', tokenUrl, true)
      const postData = platformWidgetHelper.toQueryString({
        grant_type: 'authorization_code',
        code,
        redirect_uri: `https://app.samanagestage.com${platformWidgetHelper.oauth.buildRedirectUrl()}`,
        client_id: clientId,
        client_secret: clientSecret
      }).replace(/%20/g, '+')
      xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
      xhttp.send(postData)
    } catch (e) {
      component.setState({ state: OAuthAuthenticator.AUTH_ERROR, credentials: null }, component.onAuthStateChange)
      console.error(e) // eslint-disable-line
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
    const { clientId, clientSecret, authorizationUrl } = this.props
    if (clientSecret.length === 0 || clientId.length === 0) return
    this.setState({ state: OAuthAuthenticator.AUTH_IN_PROGRESS })
    const OAuthAuthenticatorUrl = authorizationUrl + platformWidgetHelper.toQueryString({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: `https://app.samanagestage.com${platformWidgetHelper.oauth.buildRedirectUrl()}`,
      state: platformWidgetHelper.toQueryString({ closeWindow: true }),
      display: 'popup'
    })
    this.externalWindow = window.open(OAuthAuthenticatorUrl, '_blank', 'height=600,width=800,status=yes,toolbar=no,menubar=no,location=no')
    const self = this
    this.externalWindow.onbeforeunload = function() { // eslint-disable-line
      self.setState({ externalWindow: false })
      self.externalWindow = null
    }
    this.setState({ externalWindow: true })
  }

  render () {
    const { clientId, clientSecret, className } = this.props
    const { externalWindow } = this.state
    const shouldDisableButton = clientSecret.length === 0 || clientId.length === 0
    const Button = shouldDisableButton ? PlatformWidgetComponents.RegularButton : PlatformWidgetComponents.MainButton
    return (
      <Button onClick={externalWindow ? this.focusExternalWindow : this.openOAuthAuthenticator} className={className}>
        Sign in
      </Button>
    )
  }
}

OAuthAuthenticator.AUTH_IN_PROGRESS = 'in-progress'
OAuthAuthenticator.AUTHENTICATED = 'authenticated'
OAuthAuthenticator.AUTH_ERROR = 'error'
OAuthAuthenticator.NOT_AUTHENTICATED = 'not-authenticated'
