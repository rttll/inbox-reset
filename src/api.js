// Copyright 2012 Google LLC
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const fs = require('fs');
const url = require('url');
const { google } = require('googleapis');

// https://github.com/googleapis/google-api-nodejs-client/blob/master/samples/oauth2.js

// require('dotenv').config();

const scopes = ['https://www.googleapis.com/auth/gmail.modify'];
const PRODUCTION = process.env.NODE_ENV === 'production';

const keys = {
  client_id: process.env.CLIENT_ID,
  client_secret: process.env.CLIENT_SECRET,
  redirect_uri: process.env.REDIRECT_URI,
};

const host = PRODUCTION
  ? 'https://gmailreset.herokuapp.com'
  : 'http://localhost:8080';

let oauth2Client;

function _getParam(str, key) {
  const qs = new url.URL(`/?${str}`, host).searchParams;
  return qs.get(key);
}

function _setAuthClient() {
  if (oauth2Client) return;

  oauth2Client = new google.auth.OAuth2(
    keys.client_id,
    keys.client_secret,
    `${host}`
  );
}

async function setTokens(str) {
  _setAuthClient();
  const code = _getParam(str, 'code');
  const { tokens } = await oauth2Client.getToken(code);
  return oauth2Client.setCredentials(tokens); // eslint-disable-line require-atomic-updates
}

function authenticate() {
  _setAuthClient();
  const url = oauth2Client.generateAuthUrl({
    // access_type: 'offline',
    scope: scopes.join(' '),
  });

  return { url };
}

let results = [],
  pageToken = null;

async function _batch(resolve) {
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  try {
    let args = {
      userId: 'me',
      labelIds: ['INBOX'],
      // q: 'is:unread',
      maxResults: 5000,
      includeSpamTrash: false,
    };
    if (pageToken) {
      args.pageToken = pageToken;
    }
    let resp = await gmail.users.messages.list(args);
    if (!resp.data) return resolve(false);
    if (resp.data.resultSizeEstimate === 0) return resolve(false);

    results = results.concat(resp.data.messages);
    if (resp.data.nextPageToken) {
      pageToken = resp.data.nextPageToken;
      _batch(resolve);
    } else {
      pageToken = null;
      resolve(results);
    }
  } catch (err) {
    return err;
  }
}

function _getMessages() {
  results = [];
  return new Promise(function (resolve, reject) {
    _batch(resolve);
  });
}

async function messages() {
  let data = await _getMessages();
  if (data) {
    fs.writeFile('backup.json', JSON.stringify(data), () => {
      console.log('wrote backup.json');
    });
  }
  return { count: results.length };
}

async function archive() {
  let ids = results.map((obj) => obj.id);

  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  try {
    let args = {
      userId: 'me',
      requestBody: {
        ids: ids,
        removeLabelIds: ['INBOX'],
      },
    };
    return await gmail.users.messages.batchModify(args);
  } catch (err) {
    debugger;
    return err;
  }
}

module.exports = { authenticate, setTokens, messages, archive };
