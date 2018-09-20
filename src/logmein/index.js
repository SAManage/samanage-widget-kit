import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import contextTypes from 'shared/constants/contextTypes'
import LogMeInWidget, { STORAGE_KEY } from './LogMeInWidget'

export default class SamangeWidget extends Component {
  constructor (props) {
    super(props)
    this.state = { code: null }
  }

  onWidgetContextObject = (object) => {
    if (object.context_type !== contextTypes.INCIDENT) platformWidgetHelper.hide()
  }

  componentDidUpdate () {
    platformWidgetHelper.updateHeight()
  }

  componentDidMount () {
    platformWidgetHelper.getContextObject(this.onWidgetContextObject)
    platformWidgetHelper.getStorage(STORAGE_KEY, this.getTokenFromStorage)
  }

  getTokenFromStorage = (response) => {
    if (response) {
      response = JSON.parse(response)
      this.setState({ code: response.code ? response.code : '' })
    } else {
      this.setState({ code: '' })
    }
  }

  render () {
    const { code } = this.state
    if (code === null) return null
    return (
      <div className='slds slds-samanage samanage-media-query'>
        <LogMeInWidget code={code} />
      </div>
    )
  }
}

ReactDOM.render(<SamangeWidget />, document.getElementById('widgetRoot'))
