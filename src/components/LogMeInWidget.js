import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import classes from './LogMeInWidget.scss'

const VIEW_MODE = {
  LOGIN: 'LOGIN',
  GENERATE_PIN: 'GENERATE_PIN',
  DISPLAY_PIN: 'DISPLAY_PIN'
}

const URL_PREFIX = 'https://secure.logmeinrescue.com/api'
let comment = {}

export default class LogMeInWidget extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      email: '',
      password: '',
      view: VIEW_MODE.LOGIN,
      code: '',
      pin: '',
      error: false
    }
  }

  static propTypes = {
    contextId: PropTypes.string.isRequired
  }

  onEmailChange = (event) => {
    this.setState({ email: event.target.value })
  }

  onPasswordChange = (event) => {
    this.setState({ password: event.target.value })
  }

  getValueFromResponse = (response, key) => {
    console.log('getValueFromResponse: ', response, typeof response)
    if (response.indexOf('OK') === -1) {
      console.log('response isnt GOOD!')
      // var e = new Error(data)
      // handleError(e)
      this.setState({ error: true })
      return null
    }
    const splitArr = response.split(key)
    if (splitArr.length > 0) return splitArr[1]
    return null
  }

  getResponse = (response) => {
    // console.log('getAuth: ', typeof response, response)
    const code = this.getValueFromResponse(response, 'AUTHCODE:')
    if (!code) return
    this.setState({ view: VIEW_MODE.GENERATE_PIN, code })
  }

  getPinResponse = (response) => {
    const pin = this.getValueFromResponse(response, 'PINCODE:')
    const link = `https://secure.logmeinrescue.com/R?i=2&Code=${pin}`
    comment = {
      comment: {
        body: `<![CDATA[<p>Click the link below to launch your Rescue session.\n<a href="${link}">${link}</a></p>`,
        is_private: false
      }
    }
    console.log('pin: ', pin, typeof pin)
    this.setState({ view: VIEW_MODE.DISPLAY_PIN, pin })
  }

  onButtonClick = () => {
    console.log('LogMeInWidget onButtonClick') // eslint-disable-line
    const { email, password } = this.state
    if (email.length === 0 || password.length === 0) return
    const url = `${URL_PREFIX}/requestAuthCode.aspx?email=${email}&pwd=${password}`
    platformWidgetHelper.callExternalAPI('GET', url, null, this.getResponse)
  }

  generatePin = () => {
    const { code } = this.state
    const { contextId } = this.props
    const pinUrl = `${URL_PREFIX}/requestPINCode.aspx?notechconsole=1&authcode=${code}&tracking0=${contextId}`
    platformWidgetHelper.callExternalAPI('GET', pinUrl, null, this.getPinResponse)
  }

  sendLinkToComment = () => {
    const { contextId } = this.props
    platformWidgetHelper.callSamanageAPI('POST', `/incidents/${contextId}/comments.json`, comment, (response) => {
      console.log(`>>> Samanage API response:\n + ${JSON.stringify(response)}`)
    })
  }

  renderSessionPin = () => (
    <div className={classes.topDiv}>
      <PlatformWidgetComponents.RegularText className={classes.topText}>
          Your Session Pin is:
      </PlatformWidgetComponents.RegularText>
      <PlatformWidgetComponents.LargeText className={classes.pinText}>
        {this.state.pin}
      </PlatformWidgetComponents.LargeText>
      <PlatformWidgetComponents.MainButton onClick={this.sendLinkToComment} className={classes.topInput}>
          Send Link via Comment
      </PlatformWidgetComponents.MainButton>
      <PlatformWidgetComponents.RegularButton onClick={this.generatePin} className={classes.buttomInput}>
        Generate New Code
      </PlatformWidgetComponents.RegularButton>
    </div>
  )

  renderGenerateSession = () => (
    <div className={classes.topDiv}>
      <PlatformWidgetComponents.RegularText>
          Click to generate your Session Code. It will be used to conduct a remote support session
      </PlatformWidgetComponents.RegularText>
      <div></div>
      <PlatformWidgetComponents.MainButton onClick={this.generatePin}>
          Generate Session Code
      </PlatformWidgetComponents.MainButton>
    </div>
  )

  renderLogin = () => {
    const { email, password, error } = this.state
    return (
      <div className={classes.topDiv}>
        { error ? (
          <PlatformWidgetComponents.SmallText>
            {' '}
Incorrect email or password. Please try again
            {' '}
          </PlatformWidgetComponents.SmallText>
        ) : null }
        <PlatformWidgetComponents.TextField label='Email' onChange={this.onEmailChange} value={email} className={classes.topInput} />
        <PlatformWidgetComponents.TextField label='Password' onChange={this.onPasswordChange} value={password} type='password' className={classes.bottomInput} />
        <PlatformWidgetComponents.MainButton onClick={this.onButtonClick} className={classes.button}>
          Sign In
        </PlatformWidgetComponents.MainButton>
      </div>
    )
  }

  render () {
    const { view } = this.state
    // console.log('render: view=', view)
    switch (view) {
      case VIEW_MODE.LOGIN: return this.renderLogin()
      case VIEW_MODE.GENERATE_PIN: return this.renderGenerateSession()
      case VIEW_MODE.DISPLAY_PIN: return this.renderSessionPin()
      default: return null
    }
  }
}