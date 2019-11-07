import React from "react";
import { HighFiveListWrapper, Hi5 } from './highfiver.style'
import moment from 'moment'
import { HighFiveStatus } from '@constants'

type HighFiveProps = { url: String, actor: String, target: String, status: String, onAccept: Function, onReject: Function };

export function HighFive({ webId, url, actor, target, status, created, onAccept, onReject }: HighFiveProps) {

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
        <button className="ids-link-stroke ids-link-stroke--primary" onClick={() => onAccept({ url, actor, target, status })}>Hi5 Back!</button>
        <button className="ids-link-stroke ids-link-stroke--primary" onClick={() => onReject({ url, actor, target, status })}>Leave them hanging...</button>
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
      {getText()}
      {getImg()}
      {getButtons()}
      {getStatusText()}
    </Hi5>
  )
}

export function HighFiveList({ webId, items, onAccept, onReject }) {
  return (
    <HighFiveListWrapper>
      {items.map((i, idx) => (
        <HighFive key={idx} webId={webId} url={i.url} actor={i.actor} target={i.target} status={i.status} created={i.created} onAccept={onAccept} onReject={onReject} />
      ))}
    </HighFiveListWrapper>
  )
}