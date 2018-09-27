import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import contextTypes from 'shared/constants/contextTypes'
import classes from './index.scss'
import SlackIcon from './SlackIcon'

export default class SamangeWidget extends Component {
  state = {
    slackChannel: 'Yuli',
    contextId: ''
  }

  onWidgetContextObject = (object) => {
    if (object.context_type !== contextTypes.INCIDENT) platformWidgetHelper.hide()
    else this.setState({ contextId: object.context_id })
  }

  componentDidUpdate () {
    platformWidgetHelper.updateHeight(200)
  }

  componentDidMount () {
    platformWidgetHelper.getContextObject(this.onWidgetContextObject)
    platformWidgetHelper.callSamanageAPI('GET', '/setup/samanage_labs/slack_data')
      .then((response) => {
        console.log('Got slack response: ', response)
        // if (response && response.data && response.data.slackIncomingWebhook) this.setState({ slackChannel: response.data.slackIncomingWebhook.channel })
        // else platformWidgetHelper.hide()
      })
  }

  postSlackMessage = () => {
    const { contextId } = this.state
    console.log('POSTED!!', contextId)
  }

  render () {
    const { slackChannel } = this.state
    if (!slackChannel) return null
    return (
      <div className='slds slds-samanage samanage-media-query'>
        <PlatformWidgetComponents.RegularText className={classes.text}>
          {`Push important update directly to Slack channel ${slackChannel}`}
        </PlatformWidgetComponents.RegularText>
        <PlatformWidgetComponents.MainButton onClick={this.postSlackMessage} className={classes.button}>
            Post
        </PlatformWidgetComponents.MainButton>
        <SlackIcon />
      </div>
    )
  }
}

ReactDOM.render(<SamangeWidget />, document.getElementById('widgetRoot'))
