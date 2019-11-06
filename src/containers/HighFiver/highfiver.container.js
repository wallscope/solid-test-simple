import React, { useState, useEffect, useCallback } from "react";
import { withWebId, useNotification, LiveUpdate, useLiveUpdate } from '@inrupt/solid-react-components'
import { useTranslation } from 'react-i18next';
import { HighFiveList } from "./highfiver.component";
import HighFiveForm from './children/Form'
import ldflex from '@solid/query-ldflex';
import { namedNode } from '@rdfjs/data-model';
import { HighFiveStatus } from '@constants'
import { ldflexHelper, storageHelper, errorToaster, notification as helperNotification } from '@utils';

const ctx = {
  "thing": "https://schema.org/Thing#",
  "schema": "https://schema.org/",
  "xsd": "http://www.w3.org/2001/XMLSchema#",
  "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
  "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
  "as": "https://www.w3.org/ns/activitystreams#",
  "dct": "http://purl.org/dc/terms/",
  "game": "http://data.totl.net/game/"
}

const pred = {
  rdf: { type: `${ctx.rdf}type` },
  as: { actor: `${ctx.as}actor`, object: `${ctx.as}object`, target: `${ctx.as}target` },
  dct: { created: `${ctx.dct}created` },
  rdfs: { label: `${ctx.rdfs}label` }
}

function HighFiver({ webId }) {
  const [hi5Path, setHi5Path] = useState(null);
  const [friend, setFriend] = useState('');
  const { createNotification, createInbox, notifications, notification } = useNotification(webId);
  const { t } = useTranslation();

  const init = async () => {
    try {
      const hi5Url = await storageHelper.getAppStorage(webId);
      const newPath = await ldflexHelper.createContainer(hi5Url);
      if (newPath) {
        await createInbox(`${newPath}inbox/`, newPath);
        setHi5Path(newPath);
      }
    } catch (e) {
      /**
       * Check if something fails when we try to create a inbox
       * and show user a possible solution
       */
      if (e.name === 'Inbox Error') {
        return errorToaster(e.message, 'Error', {
          label: t('errorCreateInbox.link.label'),
          href: t('errorCreateInbox.link.href')
        });
      }

      errorToaster(e.message, 'Error');
    }
  };

  const sendNotification = useCallback(
    async (content, to) => {
      try {
        await createNotification(content, to);
      } catch (error) {
        errorToaster(error.message, 'Error');
      }
    },
    [friend, notifications, notification]
  );

  useEffect(() => {
    if (webId && notification.notify) init();
  }, [webId, notification.notify]);

  return (
    <section className="grid grid__one-column">
      <section className="item">
        <HighFiveForm webId={webId} sendNotification={sendNotification} setFriend={setFriend} friend={friend} />
        {hi5Path && (
          <LiveUpdate subscribe={hi5Path}>
            <ListWrapper {...{ webId, hi5Path }} />
          </LiveUpdate>
        )}
      </section>
    </section>
  )
}

export default withWebId(HighFiver)

function ListWrapper({ webId, hi5Path }) {
  const [sentList, setSentList] = useState([]);
  const [receivedList, setReceivedList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { timestamp, url } = useLiveUpdate();
  const { t } = useTranslation();
  let appPath;
  /**
   * Get basic info for the opponent player (name and image url)
   * @param {String} webId WebId of the player to look the Info for
   * @returns {Object} An object with the basic information of the player
   */
  const getUserInfo = useCallback(async webId => {
    try {
      const name = await ldflex[webId]['vcard:fn'];
      const nameValue = name && name.value.trim().length > 0 ? name.value : webId.toString();
      const imageUrl = await ldflex[webId]['vcard:hasPhoto'];
      const image = imageUrl ? imageUrl.value : 'img/people.svg';
      return { name: nameValue, image, webId };
    } catch (e) {
      return { name: webId, image: 'img/people.svg', webId };
    }
  });

  /**
   * Fetches all hi5s from a url
   * @param {String} url URL for the container to get the hi5s from
   */
  const gethi5s = useCallback(
    async url => {
      try {
        const document = await ldflexHelper.fetchLdflexDocument(url);
        let hi5List = [];
        if (!document) return hi5List;
        for await (const item of document['ldp:contains']) {
          const { value } = item;
          if (
            value.includes('.ttl') &&
            !value.includes('data.ttl') &&
            !value.includes('settings.ttl')
          )
            hi5List = [...hi5List, value];
        }
        let hi5s = [];
        for await (const item of hi5List) {
          const hi5 = await ldflexHelper.fetchLdflexDocument(item);
          if (hi5) {
            const full = await buildHi5(hi5)
            const hi5Data = { url: item, ...full }
            hi5s = [...hi5s, hi5Data];
          }
        }
        return hi5s;
      } catch (e) {
        errorToaster(e.message, 'Error');
      }
    }, [hi5Path]);

  const gethi5sFromInbox = useCallback(
    async url => {
      try {
        const document = await ldflexHelper.fetchLdflexDocument(url);
        let hi5List = [];
        if (!document) return hi5List;
        for await (const item of document['ldp:contains']) {
          // get the notification as ldflex
          const { value } = item;
          const n = await ldflexHelper.fetchLdflexDocument(value);
          const obj = await n[pred.as.object]
          if (obj.value.includes('highfiver/')) hi5List = [...hi5List, obj.value];
        }
        let hi5s = [];
        for await (const item of hi5List) {
          const hi5 = await ldflexHelper.fetchLdflexDocument(item);
          if (hi5) {
            const full = await buildHi5(hi5)
            const hi5Data = { url: item, ...full }
            hi5s = [...hi5s, hi5Data];
          }
        }
        return hi5s;
      } catch (e) {
        errorToaster(e.message, 'Error');
      }
    }, [hi5Path])

  const buildHi5 = async hi5 => {
    const hi5Data = {}
    const names = ['status', 'created', 'actor', 'target'];
    const predicates = [pred.rdfs.label, pred.dct.created, pred.as.actor, pred.as.target];
    for await (const p of predicates) {
      let values = [];
      for await (const val of hi5[p]) {
        values = [...values, val.value];
      }
      const idx = predicates.indexOf(p)
      // wee hack to get the first value
      hi5Data[names[idx]] = values.find(x => !!x)
    }
    const fullActor = await getUserInfo(hi5Data.actor)
    const fullTarget = await getUserInfo(hi5Data.target)
    
    return { ...hi5Data, actor: fullActor, target: fullTarget }
  }

  const acceptHi5 = async ({url, status}) => {
    await ldflex[url][pred.rdfs.label].replace(status, HighFiveStatus.ACCEPTED);
    init()
  }
  const rejectHi5 = async ({url, status}) => {
    await ldflex[url][pred.rdfs.label].replace(status, HighFiveStatus.DECLINED);
    init()
  }
  /**
 * Inits the hi5 by fetching own hi5s and hi5s the player has been invited to
 */
  const init = useCallback(async () => {
    setIsLoading(true);
    appPath = await storageHelper.getAppStorage(webId);

    const senthi5s = await gethi5s(hi5Path);
    setSentList(senthi5s)

    // Get the invites sent to :me
    const hi5Settings = `${appPath}settings.ttl`;
    const inboxes = await helperNotification.findUserInboxes([
      { path: webId, name: 'Global' },
      { path: hi5Settings, name: 'High Five' }
    ]);

    let receivedhi5s = [];
    for await (const inbox of inboxes) {
      const inbox5s = await gethi5sFromInbox(inbox.path)
      if (inbox5s) receivedhi5s = [...receivedhi5s, ...inbox5s]
    }
    setReceivedList(receivedhi5s)

    setIsLoading(false);
  });
  useEffect(() => {
    if (hi5Path) init();
  }, [hi5Path]);
  return (
    <section className="grid grid_two-column">
      {sentList && (<section>
        <p>Sent:</p>
        <HighFiveList items={sentList} webId={webId} />
      </section>)}
      {receivedList && (<section>
        <p>Received:</p>
        <HighFiveList items={receivedList} webId={webId} onAccept={acceptHi5} onReject={rejectHi5} />
      </section>)}
    </section>
  )
}