import React, { useState, useEffect, useCallback } from "react";
import { withWebId, ShexFormBuilder, AccessControlList } from '@inrupt/solid-react-components'
import { useTranslation } from 'react-i18next';
import { Card, Detail, Wrapper } from './shexpgnd.style'
import ldflex from '@solid/query-ldflex';
import auth from 'solid-auth-client';
import { AclApi } from 'solid-acl-utils'
import { errorToaster, storageHelper as storage, ldflexHelper as ld } from '@utils';
import { createNonExistentDocument } from "../../utils/ldflex-helper";

function ShexPlayground({ webId }) {
  const [nameStorage, setnameStorage] = useState('')
  const [addressStorage, setAddressStorage] = useState('')
  const [storageReady, setStorageReady] = useState(false)
  const [agent, setAgent] = useState('')

  const { t } = useTranslation();


  // Passing it the fetch from solid-auth-client
  const localFetch = auth.fetch.bind(auth)
  const aclApi = new AclApi(localFetch, { autoSave: false })

  const createContainer = async (webId, path) => {
    try {
      const existContainer = await ld.folderExists(path);
      // const ACLFile = new AccessControlList(webId, path);
      // await ACLFile.createACL();
      if (existContainer) {
        return path
      }
      const newPath = await ld.unsafeCreateContainer(path)
      console.log(newPath)
      // full permissions for owner are implicit
      // const ACLFile = new AccessControlList(webId, path);
      // await ACLFile.createACL();
      // const acl = await aclApi.loadFromFileUrl(path)
      // Note: Workaround, because currently no default permissions are copied when a new acl file is created. Not doing this could result in having no CONTROL permissions after the first acl.addRule call
      // if (!acl.hasRule(Permissions.ALL, webId)) {
      //   acl.addRule(Permissions.ALL, webId)
      // }
      // await acl.saveToPod()
      return newPath
    } catch (e) {
      console.log(e)
    }
  }

  const prepareStorage = async (webId, storage) => {
    await createContainer(webId, storage)
    await createNonExistentDocument(`${storage}/data.ttl`)
  }

  const init = useCallback(async () => {
    try {
      await Promise.all([
        prepareStorage(webId, nameStorage),
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
  }, [webId, nameStorage, addressStorage]);

  useEffect(() => {
    if (webId) {
      const m = storage.buildPathFromWebId(webId, "private/name/");
      setnameStorage(m);
      const a = storage.buildPathFromWebId(webId, "private/address/");
      setAddressStorage(a);
    }
  }, [webId]);

  useEffect(() => {
    if (webId && nameStorage && addressStorage) init()
  }, [webId, nameStorage, addressStorage])


  const onSuccess = (x) => {
    console.log('success', x);
  }

  const onChange = (x) => {
    console.log('change', x);
  }

  const giveFriendAccess = async () => {
    if (!agent) {
      return errorToaster("Can't give permissions to an empty agent", 'Error');
    }
    // full permissions for owner are implicit
    const ACLFile = new AccessControlList(webId, `${nameStorage}/data.ttl`);
    const permissions = [
      {
        agents: [agent],
        modes: [AccessControlList.MODES.READ]
      }
    ];
    await ACLFile.createACL(permissions);
    // const acl = await aclApi.loadFromFileUrl(nameStorage)
    // Note: Workaround, because currently no default permissions are copied when a new acl file is created. Not doing this could result in having no CONTROL permissions after the first acl.addRule call
    // if (!acl.hasRule(Permissions.ALL, webId)) {
    //   acl.addRule(Permissions.ALL, webId)
    // }
    // console.log(agent)
    // acl.addRule(Permissions.READ, agent)
    // await acl.saveToPod()
    console.log('done')
  }

  return (
    <Wrapper>
      <Card>
        <Detail>
          {(storageReady && <ShexFormBuilder
            rootShape={"NameData"} shexUri={"/shex/data.shex"}
            documentUri={nameStorage + 'data.ttl'}
            onChange={onChange} onSuccess={onSuccess} />)}

          {(storageReady && <ShexFormBuilder
            rootShape={"AddressWrapper"} shexUri={"/shex/data.shex"}
            documentUri={addressStorage + 'data.ttl'}
            onChange={onChange} onSuccess={onSuccess} />)}
          <input type="text" onInput={(evt) => setAgent(evt.target.value)} />
          <button onClick={giveFriendAccess} >Give Friend Access</button>
        </Detail>
      </Card>
    </Wrapper>
  )
}

export default withWebId(ShexPlayground)

