import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import contextTypes from 'shared/constants/contextTypes'
import Harvest from './Harvest'

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
      this.setState({ contextId: object.context_id })
    }
  }

  componentDidUpdate () {
    platformWidgetHelper.updateHeight()
  }

  componentDidMount () {
    platformWidgetHelper.getContextObject(this.onWidgetObject)
    platformWidgetHelper.getUserInfo((userInfo) => {
      this.setState({ userId: userInfo.id })
      platformWidgetHelper.getStorage(userInfo.id.toString(), this.getStorageCB)
    })
  }

  // getStorageCB = (response) => {
  //   if (response) {
  //     const responseObject = JSON.parse(response)
  //     const now = new Date().getTime()
  //     if ((responseObject.accessToken && responseObject.validUntil) && (now < responseObject.validUntil)) {
  //       this.setState({ accessToken: responseObject.accessToken })
  //       return
  //     }
  //   }
  //   this.setState({ accessToken: '' })
  // }

  render () {
    const { contextId, userId } = this.state
    return (
      <div className='slds slds-samanage samanage-media-query'>
        <Harvest contextId={contextId} userId={userId} />
      </div>
    )
  }
}

ReactDOM.render(<SamangeWidget />, document.getElementById('widgetRoot'))
