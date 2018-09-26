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
      clientId: '177650-THka9f5jQct8BnhdGxP1',
      clientSecret: 'wSUJn9fDuRxgLfdg5L8q',
      sessionDetails: {},
      accessToken: ''
      // clientId: '177650-THka9f5jQct8BnhdGxP1',
      // clientSecret: 'wSUJn9fDuRxgLfdg5L8q',
      // sessionDetails: {
      //   assigned_at: '2018-09-25T13:14:48Z',
      //   assigned_userid: 'u120083597',
      //   code: 's06-301-144',
      //   created_at: '2018-09-25T13:14:48Z',
      //   description: 'Hello, I have an issue with my printer, can you please assist?',
      //   end_customer: {name: 'Peter Niedhelp'},
      //   end_customer_link: 'https://get.teamviewer.com/s06301144',
      //   groupid: 'g132970333',
      //   state: 'Open',
      //   supporter_link: 'https://get.teamviewer.com/s06301144-rKIw9AcHRFIx',
      //   valid_until: '2018-09-26T13:14:48Z'
      // },
      // accessToken: '4343411-sjopi4AlV3PSgdurQ2hW'
    }
  }

  static propTypes = {
    contextId: PropTypes.string.isRequired
  }

  componentDidUpdate () {
    platformWidgetHelper.updateHeight(5000)
  }

  createTeamViewerSession = () => {
    const { accessToken } = this.state
    const self = this
    const xhttp = new XMLHttpRequest()
    xhttp.onreadystatechange = function() {
      if (this.readyState === 4) {
        self.setState({ sessionDetails: JSON.parse(this.responseText), view: VIEW_MODE.DISPLAY_PIN })
      }
    }
    xhttp.open('POST', 'https://l6tw4zzxz1.execute-api.us-east-1.amazonaws.com/prod/api/v1/sessions', true)
    xhttp.setRequestHeader('Authorization', `Bearer ${accessToken}`)
    xhttp.setRequestHeader('Content-Type', 'application/json')
    xhttp.send(JSON.stringify({
      groupname: 'Samanage',
      description: 'Hello, I have an issue with my printer, can you please assist?',
      end_customer: { name: 'Peter Niedhelp' },
    }))
  }

   postComment = () => {
     const { sessionDetails } = this.state
     const commentJson = {
       comment: {
         body: `<![CDATA[<p>Click the link below to start teamViewer session</p><a href="${sessionDetails.end_customer_link}">${sessionDetails.end_customer_link}</a>`,
         is_private: false
       }
     }
     platformWidgetHelper.callSamanageAPI('POST', `/incidents/${this.props.contextId}/comments.json`, commentJson)
   }

  onClientSecretChange = (event) => {
    this.setState({ clientSecret: event.target.value })
  }

  onClientIDChange = (event) => {
    this.setState({ clientId: event.target.value })
  }

  renderSessionPin = () => (
    <div className={classes.topDiv}>
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
  )

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
        <PlatformWidgetComponents.TextField label='Client ID' onChange={this.onClientIDChange} value={clientId} />
        <PlatformWidgetComponents.TextField label='Client Secret' onChange={this.onClientSecretChange} value={clientSecret} />
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
    switch (view) {
      case VIEW_MODE.LOGIN: return this.renderLogin()
      case VIEW_MODE.GENERATE_PIN: return this.renderGenerateSession()
      case VIEW_MODE.DISPLAY_PIN: return this.renderSessionPin()
      default: return null
    }
  }
}
