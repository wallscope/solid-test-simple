import React from "react";
import { HighFiveListWrapper, Hi5 } from './highfiver.style'
import moment from 'moment'
import { HighFiveStatus } from '@constants'

type HighFiveProps = { url: String, actor: String, target: String, status: String, onAccept: Function, onReject: Function, onDelete: Function };

export function HighFive({ webId, url, actor, target, status, created, onAccept, onReject, onDelete }: HighFiveProps) {
  const props = {url, actor, target, status, created}
  const getText = () => {
    if (webId === actor.webId) {
      return (<p>Sent High Five Hi5 to <br />{actor.name}</p>)
    }
    return (<p>Got High Five Hi5 from <br />{actor.name}</p>)
  }
  const getImg = () => {
    if (status === HighFiveStatus.ACCEPTED) {
      return <img alt={url} src="/img/high5-filled.svg" />
    }
    if (status === HighFiveStatus.DECLINED) {
      return <img alt={url} src="/img/high5-denied.svg" />
    }
    return <img alt={url} src="/img/high5.svg" />
  }

  const getButtons = () => {
    if (webId !== actor.webId && status !== HighFiveStatus.ACCEPTED && status !== HighFiveStatus.DECLINED) {
      return <div>
        <button className="ids-link-stroke ids-link-stroke--primary" onClick={() => onAccept(props)}>Hi5 Back!</button>
        <button className="ids-link-stroke ids-link-stroke--primary" onClick={() => onReject(props)}>Leave them hanging...</button>
      </div>
    }
    return
  }

  const getStatusText = () => {
    if (status !== HighFiveStatus.INVITESENT) return (<p>{status}</p>)
    const timeSince = moment.duration(moment(created).diff(moment()))
    if (webId === actor.webId) {
      return (<p> You've been left hanging for {timeSince.humanize()}</p>)
    }
    return (<p> You've left them hanging for {timeSince.humanize()}</p>)
  }

  return (
    <Hi5>
      <div className="delete">
        <button className="ids-link-stroke" onClick={() => onDelete(props)}>Delete</button>
      </div>
      {getText()}
      {getImg()}
      {getButtons()}
      {getStatusText()}
    </Hi5>
  )
}

export function HighFiveList({ webId, items, onAccept, onReject }) {
  // create a sorted list of hi5s. have to copy the array to avoid mutating the prop
  const list = [...items].sort((a,b) => moment(b.created).diff(moment(a.created)))
  return (
    <HighFiveListWrapper>
      {list.map((i, idx) => (
        <HighFive key={idx} webId={webId} url={i.url} actor={i.actor} target={i.target} status={i.status} created={i.created} onAccept={onAccept} onReject={onReject} />
      ))}
    </HighFiveListWrapper>
  )
}