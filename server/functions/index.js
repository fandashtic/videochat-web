const express = require('express');
const functions = require('firebase-functions');
var {RtcTokenBuilder, RtmTokenBuilder, RtcRole, RtmRole} = require('agora-access-token');
const config = require('./firebase-config.json');
const cors = require('cors');
const admin = require('firebase-admin');
const app = express();

// app.use(cors({ origin: true }));

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

admin.initializeApp({
    credential: admin.credential.cert(config.tocken),
    databaseURL: config.databaseURL
});
const db = admin.firestore();

exports.helloWorld = functions.https.onRequest((request, response) => {
 response.send("Hello from Firebase!");
});


// Fill the appID and appCertificate key given by Agora.io
var appID = config.agora_io.appID;
var appCertificate = config.agora_io.appCertificate;

// token expire time, hardcode to 3600 seconds = 1 hour
var expirationTimeInSeconds = 3600
var role = RtcRole.PUBLISHER

exports.generateRtcToken = functions.https.onRequest((req, resp) => {
    var currentTimestamp = Math.floor(Date.now() / 1000)
    var privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds
    var channelName = req.query.channelName + Math.random();

    // use 0 if uid is not specified
    var uid = req.query.uid || 0
    if (!channelName) {
        return resp.status(400).json({ 'error': 'channel name is required' }).send();
    }
    
    var token = RtcTokenBuilder.buildTokenWithUid(appID, appCertificate, channelName, uid, role, privilegeExpiredTs);

    resp.header("Access-Control-Allow-Origin", "*")
    return resp.json({ 'token': token, 'appId':  appID}).send();
});

exports.generateRtmToken = functions.https.onRequest((req, resp) => {
    var currentTimestamp = Math.floor(Date.now() / 1000)
    var privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds
    var account = req.query.account;
    if (!account) {
        return resp.status(400).json({ 'error': 'account is required' }).send();
    }

    var key = RtmTokenBuilder.buildToken(appID, appCertificate, account, RtmRole, privilegeExpiredTs);

    resp.header("Access-Control-Allow-Origin", "*")
        //resp.header("Access-Control-Allow-Origin", "http://ip:port")
    return resp.json({ 'key': key }).send();
});

exports.getUser = functions.https.onRequest(async (request, response) => {
    var root = String(request.query.root);
    const snapshot = await db.collection(root).get();
    entries = snapshot.empty ? [] : snapshot.docs.map(doc => Object.assign(doc.data(), { id: doc.id }));
    response.header("Access-Control-Allow-Origin", "*")
    response.send(entries);
});