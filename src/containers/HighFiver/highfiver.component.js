import React from "react";
import { HighFiveStatus } from '@constants'

type HighFiveProps = { url: String, actor: String, target: String, status: String, onAccept: Function, onReject: Function };

export function HighFive({ webId, url, actor, target, status, onAccept, onReject }: HighFiveProps) {
  if (webId === actor.webId) {
    return (
      <section>
        <h1>Sent a Hi5 to {target.name}: {status}</h1>
      </section>
    )
  }
  return (
    <section>
      <h1>Got a Hi5 from {actor.name}: {status}</h1>
      {(status === HighFiveStatus.INVITESENT) && (<button onClick={() => onAccept({ url, actor, target, status })}>Hi5 Back!</button>)}
      {(status === HighFiveStatus.INVITESENT) && (<button onClick={() => onReject({ url, actor, target, status })}>Leave them hanging...</button>)}
    </section>
  )
}

export function HighFiveList({ webId, items, onAccept, onReject }) {
  return (
    <div>
      {items.map((i, idx) => (
        <HighFive key={idx} webId={webId} url={i.url} actor={i.actor} target={i.target} status={i.status} onAccept={onAccept} onReject={onReject} />
      ))}
    </div>
  )
}