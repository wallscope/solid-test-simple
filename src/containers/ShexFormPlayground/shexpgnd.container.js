import React, { useState, useEffect, useCallback } from "react";
import { withWebId, ShexFormBuilder, AccessControlList } from '@inrupt/solid-react-components'
import { useTranslation } from 'react-i18next';
import { Card, Detail, Wrapper } from './shexpgnd.style'
import ldflex from '@solid/query-ldflex';
import { errorToaster, storageHelper as storage, ldflexHelper as ld } from '@utils';
import { createNonExistentDocument } from "../../utils/ldflex-helper";

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

function ShexPlayground({ webId }) {
  const [marriageStorage, setMarriageStorage] = useState('')
  const [addressStorage, setAddressStorage] = useState('')
  const [storageReady, setStorageReady] = useState(false)

  const { t } = useTranslation();

  const createContainer = async (webId, path) => {
    const existContainer = await ld.folderExists(path);
    if (existContainer) {
      return path
    }
    // full permissions for owner are implicit
    const ACLFile = new AccessControlList(webId, path);
    await ACLFile.createACL();
    return await ld.unsafeCreateContainer(path)
  }

  const prepareStorage = async (webId, storage) => {
    await createContainer(webId, storage)
    await createNonExistentDocument(`${storage}/data.ttl`)
  }

  const init = useCallback(async () => {
    try {
      await Promise.all([
        prepareStorage(webId, marriageStorage),
        prepareStorage(webId, addressStorage),
      ]);
      setStorageReady(true);
    } catch (e) {
      console.error(e)
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
  }, [webId, marriageStorage, addressStorage]);

  useEffect(() => {
    if (webId) {
      const m = storage.buildPathFromWebId(webId, "private/marriage/");
      setMarriageStorage(m);
      const a = storage.buildPathFromWebId(webId, "private/address/");
      setAddressStorage(a);
    }
  }, [webId]);

  useEffect(() => {
    if (webId && marriageStorage && addressStorage) init()
  }, [webId, marriageStorage, addressStorage])


  const onSuccess = (x) => {
    console.log('success', x);
  }

  const onChange = (x) => {
    console.log('change', x);
  }

  const giveFriendAccess = async () => {
    const friend = "https://belvederef.inrupt.net/profile/card#me";
    // full permissions for owner are implicit
    const ACLFile = new AccessControlList(webId, `${marriageStorage}/data.ttl`);
    const permissions = [
      {
        agents: [friend],
        modes: [AccessControlList.MODES.READ]
      }
    ];
    await ACLFile.createACL(permissions);
    console.log('done')
  }

  return (
    <Wrapper>
      <Card>
        <Detail>
          {(storageReady && <ShexFormBuilder
            rootShape={"MarriageData"} shexUri={"/shex/data.shex"}
            documentUri={marriageStorage + 'data.ttl'}
            onChange={onChange} onSuccess={onSuccess} />)}

          {(storageReady && <ShexFormBuilder
            rootShape={"AddressData"} shexUri={"/shex/data.shex"}
            documentUri={addressStorage + 'data.ttl'}
            onChange={onChange} onSuccess={onSuccess} />)}

          <button onClick={giveFriendAccess} >Give Friend Access</button>
        </Detail>
      </Card>
    </Wrapper>
  )
}

export default withWebId(ShexPlayground)

