import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import contextTypes from 'shared/constants/contextTypes'
import TeamViewer from './TeamViewer'

export default class SamangeWidget extends Component {
  constructor (props) {
    super(props)
    this.state = {
      contextId: '',
      userId: '',
      accessToken: null
    }
  }

  onWidgetObject = (object) => {
    if (object.context_type !== contextTypes.INCIDENT) {
      platformWidgetHelper.hide()
    } else {
      platformWidgetHelper.getUserInfo((user_info) => {
        this.setState({ contextId: object.context_id, userId: user_info.id })
        platformWidgetHelper.getStorage(user_info.id.toString(), this.getStorageCB)
      })
    }
  }

  componentDidUpdate () {
    platformWidgetHelper.updateHeight(1500)
  }

  componentDidMount () {
    platformWidgetHelper.getContextObject(this.onWidgetObject)
  }

  getStorageCB = (response) => {
    if (response) {
      const responseObject = JSON.parse(response)
      const now = new Date().getTime()
      debugger // eslint-disable-line
      if ((responseObject.accessToken && responseObject.validUntil) && (now < responseObject.validUntil)) {
        this.setState({ accessToken: responseObject.accessToken })
        return
      }
    }
    this.setState({ accessToken: '' })
  }

  render () {
    const { contextId, userId, accessToken } = this.state
    if (accessToken === null) return null
    return (
      <div className='slds slds-samanage samanage-media-query'>
        <TeamViewer contextId={contextId} userId={userId} accessToken={accessToken} />
      </div>
    )
  }
}

ReactDOM.render(<SamangeWidget />, document.getElementById('widgetRoot'))
