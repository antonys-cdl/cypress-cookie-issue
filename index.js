"use strict";

const express = require("express");
const vhost = require("vhost");
const cookieParser = require("cookie-parser");

const hosts = require("./hosts.js");

console.log(hosts);

const mainSite = express();
const secondarySite = express();

const app = express();
const port = 9300;
let server;

const minute = 60000;

mainSite.use(cookieParser());
secondarySite.use(cookieParser());

function randomSequence() {
  return Math.random().toString(20).substr(2, 6);
}

const pages = {
  root: function (req, res, domain1, domain2) {
    let cookieValue = "MAINSITE" + randomSequence();
    res.cookie("SESSIONID", cookieValue, { domain: domain1, maxAge: 5 * minute })
      .send(`<!doctype html>
        <html lang=en><meta charset=utf-8><title>MAIN SITE</title>
        <h1>Main application</h1>
        <p>Set cookie to ${cookieValue}
        <p><a id='setcookiesame' href='http://${domain1}:9300/subpath/set-cookie'>Visit same domain, setting a cookie</a>
        <p><a id='nocookiesame' href='http://${domain1}:9300/subpath/no-cookie'>Visit same domain, just navigating</a>
        
        <p><a id='setcookie' href='http://${domain2}:9300/subpath/set-cookie'>Visit 2nd domain, setting a cookie</a>
        <p><a id='nocookie' href='http://${domain2}:9300/subpath/no-cookie'>Visit 2nd domain, just navigating</a>`);
  },

  secondLocation: function (req, res, domain1, domain2) {
    let cookieValue = "SECONDSITE" + randomSequence();
    res.cookie("SESSIONID", cookieValue, {
      domain: domain2,
      maxAge: 5 * minute,
      path: "/subpath/",
    }).send(`<!doctype html>
        <html lang=en><meta charset=utf-8><title>SECONDARY SITE</title>
        <h1>Secondary application</h1>
        <p>Set cookie to ${cookieValue}
        <p><a id='finish' href='http://${domain1}:9300/return'>Finish actions here</a>`);
  },

  secondLocationNoCookie: function (req, res, domain1, domain2) {
    res.send(`<!doctype html>
        <html lang=en><meta charset=utf-8><title>SECONDARY SITE</title>
        <h1>Secondary application</h1>
        <p>Didn't attempt to set a cookie
        <p><a id='finish' href='http://${domain1}:9300/return'>Finish actions here</a>`);
  },

  finished: function (req, res, domain1, domain2) {
    res.send(`<!doctype html>
          <html lang=en><meta charset=utf-8><title>MAIN SITE</title>
          <h1>Main application</h1>
          <p id='cookieValue'>Cookie is set to: ${req.cookies.SESSIONID}
          <p><a href='http://${domain1}:9300/'>Start again</a>`);
  },
};

mainSite.get("/", (req, res) => {
  pages.root(req, res, hosts.main, hosts.secondary);
});

secondarySite.get("/subpath/no-cookie", (req, res) => {
  pages.secondLocationNoCookie(req, res, hosts.main, hosts.secondary);
});

secondarySite.get("/subpath/set-cookie", (req, res) => {
  pages.secondLocation(req, res, hosts.main, hosts.secondary);
});

mainSite.get("/subpath/no-cookie", (req, res) => {
  pages.secondLocationNoCookie(req, res, hosts.main, hosts.main);
});

mainSite.get("/subpath/set-cookie", (req, res) => {
  pages.secondLocation(req, res, hosts.main, hosts.main);
});

mainSite.get("/return", (req, res) => {
  pages.finished(req, res, hosts.main, hosts.secondary);
});

app.use(vhost(hosts.main, mainSite));
app.use(vhost(hosts.secondary, secondarySite));

server = app.listen(port, () => {
  console.log(`Cookie-handler listening on port ${port}`);
});

process.on("SIGTERM", () => {
  debug("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    debug("HTTP server closed");
  });
});
