import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import { namedNode } from '@rdfjs/data-model';
import { HighFiveStatus } from '@constants'
import { AccessControlList } from '@inrupt/solid-react-components';
import {
  ldflexHelper,
  errorToaster,
  successToaster,
  storageHelper,
  notification as helperNotification
} from '@utils';

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
  rdfs: { label: `${ctx.rdfs}label` },
  as: { actor: `${ctx.as}actor`, object: `${ctx.as}object`, target: `${ctx.as}target` },
  dct: { created: `${ctx.dct}created` },
}
const types = { as: { Activity: `${ctx.as}Activity` } }

const HighFiveForm = ({ webId, sendNotification, setFriend, friend }) => {
  const [uniqueId, setUniqueId] = useState(Date.now());
  const [documentUri, setDocumentUri] = useState(`${uniqueId}.ttl`);
  const { t } = useTranslation();

  const reset = () => {
    setDocumentUri('');
    setFriend('');
    setUniqueId(Date.now());
    setDocumentUri(`${uniqueId}.ttl`);
  };


  const hi5Object = friend => ({
    status: HighFiveStatus.INVITESENT,
    created: moment().format(),
    actor: namedNode(webId),
    target: namedNode(friend),
  });

  const createHighFive = async (documentUri: String, friend: String) => {
    try {
      /**
       * Get full friend game path
       */
      const appPath = await storageHelper.getAppStorage(friend);
      const hi5Settings = `${appPath}settings.ttl`;
      /**
       * Find friend inboxes from a document link
       */
      const inboxes = await helperNotification.findUserInboxes([
        { path: friend, name: 'Global' },
        { path: hi5Settings, name: 'High Five' }
      ]);
      /**
       * If friend has at least one inbox, create a game and send a notification
       * Otherwise, show an error message
       * */
      if (inboxes.length > 0) {
        const newDocument = await ldflexHelper.createNonExistentDocument(documentUri);
        /**
         * If game already exist show an error message
         */
        if (!newDocument) {
          errorToaster(`${documentUri} ${t('game.alreadyExists')}`, t('notifications.error'));
          return null;
        }

        /**
         * If document was created we will initialize the game, otherwise show an error
         */
        if (newDocument.ok) {
          const document = await ldflexHelper.fetchLdflexDocument(documentUri);
          const setupObj = hi5Object(friend);

          /**
           * Create LD structure of document
           * <> a as:Activity ;
           *  as:actor <me> ;
           *  dct:created "YYYY-MM-DDThh:mm:ss"^^xsd:date ;
           *  as:target <friend> .
           */
          await Promise.all([
            document[pred.rdf.type].add(namedNode(types.as.Activity)),
            document[pred.as.actor].add(setupObj.actor),
            document[pred.dct.created].add(setupObj.created),
            document[pred.as.target].add(setupObj.target),
            document[pred.rdfs.label].add(setupObj.status),
          ])

          console.log(`created high five to ${friend}`)

          /**
           * Find the friend's game-specific inbox. If it doesn't exist, get the global inbox instead
           * @to: friend inbox path
           */
          const to = helperNotification.getDefaultInbox(inboxes, 'High Five', 'Global');
          const target = `${window.location.href}?hi5=${btoa(documentUri)}`;
          await sendNotification(
            {
              title: 'High Five!',
              summary: `sent you a high five. Don't leave them hanging!`,
              actor: webId,
              object: documentUri,
              target
            },
            to.path
          );

          reset()
          return true;
        }
        errorToaster(`${friend} ${t('game.createFolder.message')}`, t('notifications.error'));
        return null;
      }
      console.log('inboxes empty')
      errorToaster(`${friend} ${t('noInboxfriend.message')}`, t('notifications.error'), {
        label: t('noInboxfriend.link.label'),
        href: t('noInboxfriend.link.href')
      });

      return null;
    } catch (e) {
      console.error(e)
      throw new Error(e);
    }
  };

  /**
   * Creates a new game based on an friend's webId and a game document url with an acl file
   * @param {Event} e Submit event
   */
  const onSubmit = async e => {
    try {
      e.preventDefault();
      const appPath = await storageHelper.getAppStorage(webId);
      const documentPath = `${appPath}${documentUri}`;
      if (!friend || friend === '') {
        errorToaster(t('game.friendMissing'), t('game.errorTitle'));
        return;
      }

      if (webId === friend) {
        errorToaster(t('game.myself'), t('game.errorTitle'));
        return;
      }

      const result = await createHighFive(documentPath, friend);
      if (result) {
        const permissions = [
          {
            agents: [friend],
            modes: [AccessControlList.MODES.READ, AccessControlList.MODES.WRITE]
          }
        ];
        const ACLFile = new AccessControlList(webId, documentPath);
        await ACLFile.createACL(permissions);
        successToaster(t('game.createGameSuccess'), t('notifications.success'));
      }
    } catch (e) {
      errorToaster(e.message, t('game.errorTitle'));
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <div className="input-wrap"><label>Who do you want to High Five?:</label>
        <input type="text" placeholder="Web ID" onChange={e => setFriend(e.target.value)} />
      </div>
      <button type="submit" className="ids-link-stroke ids-link-stroke--primary">Button</button>
    </form>
  )
}

export default HighFiveForm