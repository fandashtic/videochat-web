import React from "react";
import axios from 'axios';

// Set config defaults when creating the instance
const instance = axios.create({
  baseURL: "https://us-central1-videocall-3e257.cloudfunctions.net/",  
  responseType: "json",
});

// Alter defaults after instance has been created
//instance.defaults.headers.common['Access-Control-Allow-Origin'] = '*';
//instance.defaults.headers.common['ontent-Type'] = 'application/json';

export default instance;
