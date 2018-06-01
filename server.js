/**
 * Copyright 2017, Google, Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

// Require process, so we can mock environment variables
const process = require('process');

// [START app]
const express = require('express');
const Knex = require('knex');
const crypto = require('crypto');

const app = express();
app.enable('trust proxy');

const knex = connect();

function connect () {
  // [START connect]
  const config = {
      user: process.env.SQL_USER,
      password: process.env.SQL_PASSWORD,
      database: process.env.SQL_DATABASE,
      ssl: {
          ca: fs.readFileSync('ssl/server-ca.pem'),
          key: fs.readFileSync('ssl/client-key.pem'),
          cert: fs.readFileSync('ssl/client-cert.pem'),
          rejectUnauthorized: false
      },
      ssl_verify_server_cert: true
  };

  if (process.env.INSTANCE_CONNECTION_NAME && process.env.NODE_ENV === 'production') {
    config.socketPath = `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`;
  }  
  if (process.env.NODE_ENV === 'dev') {
    config.host = '35.226.111.174';
  }

  // Connect to the database
  const knex = Knex({
    client: 'mysql',
    connection: config
  });
  // [END connect]

  return knex;
}

/**
 * Insert a visit record into the database.
 *
 * @param {object} knex The Knex connection object.
 * @param {object} visit The visit record to insert.
 * @returns {Promise}
 */
function insertVisit (knex, visit) {
  return knex('visits').insert(visit);
}

/**
 * Retrieve the latest 10 visit records from the database.
 *
 * @param {object} knex The Knex connection object.
 * @returns {Promise}
 */
function getVisits (knex) {
  return knex.select('timestamp', 'userIp')
    .from('visits')
    .orderBy('timestamp', 'desc')
    .limit(10)
    .then((results) => {
      return results.map((visit) => `Time: ${visit.timestamp}, AddrHash: ${visit.userIp}`);
    });
}

app.get('/', (req, res, next) => {
  // Create a visit record to be stored in the database
  const visit = {
    timestamp: new Date(),
    // Store a hash of the visitor's ip address
    userIp: crypto.createHash('sha256').update(req.ip).digest('hex').substr(0, 7)
  };

  insertVisit(knex, visit)
    // Query the last 10 visits from the database.
    .then(() => getVisits(knex))
    .then((visits) => {
      res
        .status(200)
        .set('Content-Type', 'text/plain')
        .send(`Last 10 visits:\n${visits.join('\n')}`)
        .end();
    })
    .catch((err) => {
      next(err);
    });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});
// [END app]

module.exports = app;
