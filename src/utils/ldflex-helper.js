import auth from 'solid-auth-client';
import ldflex from '@solid/query-ldflex';

export const documentPing = async documentUri =>
  auth.fetch(documentUri, {
    headers: {
      'Content-Type': 'text/turtle'
    }
  });

  export const documentExists = async documentUri => {
    const {status} = await documentPing(documentUri);
    return status !== 404;
  }

const createDoc = async (documentUri, options) => {
  try {
    return await auth.fetch(documentUri, options);
  } catch (e) {
    throw e;
  }
};

export const deleteFile = async url => {
  try {
    return await auth.fetch(url, { method: 'DELETE' });
  } catch (e) {
    throw e;
  }
};

export const createDocument = async (documentUri, body = '') => {
  try {
    const options = {
      method: 'PUT',
      headers: {
        'Content-Type': 'text/turtle'
      },
      body
    };
    return await createDoc(documentUri, options);
  } catch (e) {
    throw e;
  }
};

export const createDocumentWithTurtle = async (documentUri, body = '') => {
  try {
    return createDoc(documentUri, {
      method: 'PUT',
      headers: {
        'Content-Type': 'text/turtle'
      },
      body
    });
  } catch (e) {
    throw e;
  }
};

export const createNonExistentDocument = async (documentUri, body = '') => {
  try {
    const result = await documentPing(documentUri);

    return result.status === 404 ? createDocument(documentUri, body) : null;
  } catch (e) {
    throw e;
  }
};

export const fetchLdflexDocument = async documentUri => {
  try {
    const result = await documentPing(documentUri);
    if (result.status === 404) return null;
    const document = await ldflex[documentUri];
    return document;
  } catch (e) {
    throw e;
  }
};

export const folderExists = async folderPath => {
  const result = await auth.fetch(folderPath);
  return result.status === 403 || result.status === 200;
};

export const discoverInbox = async document => {
  try {
    const documentPing = await folderExists(document);
    if (!documentPing) return false;

    const inboxDocument = await ldflex[document]['ldp:inbox'];
    const inbox = inboxDocument ? await inboxDocument.value : false;
    return inbox;
  } catch (error) {
    throw error;
  }
};

export const createContainer = async folderPath => {
  try {
    const existContainer = await folderExists(folderPath);
    console.log(folderPath, "exists: ", existContainer)
    const data = `${folderPath}data.ttl`;
    if (existContainer) return folderPath;

    await createDoc(data, {
      method: 'PUT',
      headers: {
        'Content-Type': 'text/turtle'
      }
    });

    return folderPath;
  } catch (error) {
    throw new Error(error);
  }
};

export const unsafeCreateContainer = async folderPath => {
  try {
    await createDoc(`${folderPath}data.ttl`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'text/turtle'
      }
    });

    return folderPath;
  } catch (error) {
    throw new Error(error);
  }
};
