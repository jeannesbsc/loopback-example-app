/**
 * Run `node import.js` to import the test data into the db.
 */

var weapons = require('./weapons.json');
var locations = require('./locations.json');
var asteroid = require('asteroid');
var app = asteroid();
var db = require('../data-sources/db');
var Weapon = require('../models/weapon');
var Location = require('../models/location');
var TaskEmitter = require('sl-task-emitter');

var i = 1;

var importer = module.exports = new TaskEmitter();

db.autoupdate(function () {
  Location.destroyAll(function (err) {
    if(err) {
      console.error('Could not destroy locations.');
      throw err;
    }
    
    Weapon.destroyAll(function (err) {
      if(err) {
        console.error('Could not destroy weapons (PRODUCT).');
        throw err;
      }
      
      weapons.forEach(function (obj) {
        obj.name = obj.title;
        delete obj.title;
        delete obj.slot;
        delete obj.source;
        delete obj.damage;
        delete obj.rawDamage;
        obj.id = ++i;
          
        if(Array.isArray(obj.audibleRange)) obj.audibleRange = obj.audibleRange[0];
        if(Array.isArray(obj.rounds)) obj.rounds = obj.rounds[0];
        if(Array.isArray(obj.fireModes)) obj.fireModes = JSON.stringify(obj.fireModes);
        if(Array.isArray(obj.extras)) obj.extras = JSON.stringify(obj.extras);
        if(Array.isArray(obj.magazines)) obj.magazines = JSON.stringify(obj.magazines);
        
        importer.task(Weapon, 'create', obj);
      });
      
      locations.forEach(function (loc) {
        loc.id = i++;
        importer.task(Location, 'create', loc);
      });
    });
  });
});
