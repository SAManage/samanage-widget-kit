import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import OAuthAuthenticator from 'shared/components/OAuthAuthenticator'
import TeamViewerIcon from './TeamViewerIcon'
import classes from './index.scss'

const VIEW_MODE = {
  LOGIN: 'LOGIN',
  GENERATE_PIN: 'GENERATE_PIN',
  DISPLAY_PIN: 'DISPLAY_PIN'
}

export default class TeamViewer extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      view: VIEW_MODE.LOGIN,
      posted: false,
      clientId: '',
      clientSecret: '',
      sessionDetails: {},
      accessToken: ''
    }
  }

  static propTypes = {
    contextId: PropTypes.string.isRequired,
    userId: PropTypes.string.isRequired
  }

  componentDidMount () {
    const { accessToken } = this.props
    if (accessToken.length > 0) this.setState({ view: VIEW_MODE.GENERATE_PIN, accessToken })
  }

  componentDidUpdate () {
    platformWidgetHelper.updateHeight(5000)
  }

  createTeamViewerSession = () => {
    const { accessToken } = this.state
    const { userId } = this.props
    const self = this
    const xhttp = new XMLHttpRequest()
    xhttp.onreadystatechange = function() {
      if (this.readyState === 4) {
        self.setState({ sessionDetails: JSON.parse(this.responseText), view: VIEW_MODE.DISPLAY_PIN })
        const StringDate = new Date(JSON.parse(this.responseText).valid_until)
        const validUntil = StringDate.getTime()
        const value = JSON.stringify({ accessToken, validUntil })
        platformWidgetHelper.setStorage(userId.toString(), value, validUntil )
      }
    }
    xhttp.open('POST', 'https://l6tw4zzxz1.execute-api.us-east-1.amazonaws.com/prod/api/v1/sessions', true)
    xhttp.setRequestHeader('Authorization', `Bearer ${accessToken}`)
    xhttp.setRequestHeader('Content-Type', 'application/json')
    xhttp.send(JSON.stringify({
      groupname: 'Samanage'
    }))
  }

  postComment = () => {
    const self = this
    const { sessionDetails } = this.state
    const commentJson = {
      comment: {
        body: `<![CDATA[<p>Click the link below to start teamViewer session</p><a href="${sessionDetails.end_customer_link}">${sessionDetails.end_customer_link}</a>`,
        is_private: false
      }
    }
    platformWidgetHelper.callSamanageAPI('POST', `/incidents/${this.props.contextId}/comments.json`, commentJson, (response) => {
      if (response && !response.errorText) { self.setState({ posted: true}) }
    })
  }

  renderPostedMessage = (posted) => {
    if (!posted) return null
    return (
      <div className={classes.copyText}>
        <PlatformWidgetComponents.Icon icon='check' style={{ fill: 'green', marginRight: '8px', width: '20px', height: '20px', paddingBottom: '3px' }} />
        Link Posted successfully
      </div>
    )
  }

  onClientSecretChange = (event) => {
    this.setState({ clientSecret: event.target.value })
  }

  onClientIDChange = (event) => {
    this.setState({ clientId: event.target.value })
  }

  renderSessionPin = () => {
    const { posted } = this.state
    return (
      <div className={classes.topDiv}>
        { this.renderPostedMessage(posted) }
        <PlatformWidgetComponents.RegularText className={classes.topText}>
              Your Session Code is:
        </PlatformWidgetComponents.RegularText>
        <PlatformWidgetComponents.LargeText className={classes.pinText}>
          {this.state.sessionDetails.code}
        </PlatformWidgetComponents.LargeText>
        <div className={classes.buttons}>
          <PlatformWidgetComponents.MainButton className={classes.button} onClick={this.postComment}>
            Send Link via comment
          </PlatformWidgetComponents.MainButton>
          <PlatformWidgetComponents.RegularButton  onClick={this.createTeamViewerSession} className={classes.button}>
            Generate New Code
          </PlatformWidgetComponents.RegularButton>
        </div>
        <TeamViewerIcon />
      </div>
    )}

  renderGenerateSession = () => (
    <div className={classes.topDiv}>
      <PlatformWidgetComponents.RegularText className={classes.text}>
          Click to generate your Session Code. It will be used to conduct a remote support session
      </PlatformWidgetComponents.RegularText>
      <PlatformWidgetComponents.MainButton onClick={this.createTeamViewerSession} className={classes.button}>
          Generate Session Code
      </PlatformWidgetComponents.MainButton>
      <TeamViewerIcon />
    </div>
  )

  renderLogin = () => {
    const { clientId, clientSecret } = this.state
    return (
      <div className={classes.topDiv}>
        <div className={classes.clientId}>
          <PlatformWidgetComponents.TextField label='Client ID' onChange={this.onClientIDChange} value={clientId} />
        </div>
        <div className={classes.clientSecret}>
          <PlatformWidgetComponents.TextField label='Client Secret' type='password'  onChange={this.onClientSecretChange} value={clientSecret} />
        </div>
        <OAuthAuthenticator
          onStateChange={({ state, credentials }) => {
            if (state === OAuthAuthenticator.AUTHENTICATED) {
              this.setState({ accessToken: credentials.access_token, view: VIEW_MODE.GENERATE_PIN })
            }
          }}
          clientId={clientId}
          clientSecret={clientSecret}
          tokenUrl='https://webapi.teamviewer.com/api/v1/oauth2/token'
          authorizationUrl='https://webapi.teamviewer.com/api/v1/oauth2/authorize?'
          className={classes.button}
        />
        <TeamViewerIcon />
      </div>
    )
  }

  render () {
    const { view } = this.state
    const { userId } = this.props
    const temp = platformWidgetHelper.getStorage(userId.toString(), this.getStorageCB)
    switch (view) {
      case VIEW_MODE.LOGIN: return this.renderLogin()
      case VIEW_MODE.GENERATE_PIN: return this.renderGenerateSession()
      case VIEW_MODE.DISPLAY_PIN: return this.renderSessionPin()
      default: return null
    }
  }
}
