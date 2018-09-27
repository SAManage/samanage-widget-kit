import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import contextTypes from 'shared/constants/contextTypes'
import classes from './index.scss'

export default class SamangeWidget extends Component {
  // constructor (props) {
  //   super(props)
  //   this.state = { slackInfo: {} }
  // }

  onWidgetContextObject = (object) => {
    if (object.context_type !== contextTypes.INCIDENT) platformWidgetHelper.hide()
  }

  componentDidUpdate () {
    platformWidgetHelper.updateHeight()
  }

  componentDidMount () {
    platformWidgetHelper.getContextObject(this.onWidgetContextObject)
    platformWidgetHelper.callSamanageAPI('GET', 'setup/samanage_labs/slack_data', (response) => {
      debugger // eslint-disable-line
      console.log('Got slack response: ', response)
    })
    // platformWidgetHelper.getStorage(STORAGE_KEY, this.getTokenFromStorage)
  }

  postSlackMessage () {
    console.log('POSTED!!')
  }

  render () {
    return (
      <div className='slds slds-samanage samanage-media-query'>
        <PlatformWidgetComponents.RegularText className={classes.text}>
            Push inportant update directly to Slack channel
        </PlatformWidgetComponents.RegularText>
        <PlatformWidgetComponents.MainButton onClick={this.postSlackMessage} className={classes.button}>
            Post
        </PlatformWidgetComponents.MainButton>
      </div>
    )
  }
}

ReactDOM.render(<SamangeWidget />, document.getElementById('widgetRoot'))
