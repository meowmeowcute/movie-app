var sqlite3 = require('sqlite3');
var express = require('express');
var uuid = require('uuid');
var assert = require('assert');
var _ = require('underscore');

var app = express();
app.use(express.bodyParser());

var db;
setupDatabase(function() {

  // A (more-or-less) RESTful JSON API for the client-side Javascript to talk to

  app.get('/genres', function(req, res) {
    db.all('SELECT * FROM genre', function(err, rows) {
      if (err) throw err;
      res.send(rows);
    });
  });

  app.get('/movies', function(req, res) {
    db.all('SELECT * FROM movie', function(err, rows) {
      if (err) throw err;
      var movies = rows;
      movies.forEach(function(movie) {
        if (movie.genre_fks)
          movie.genre_fks = movie.genre_fks.split(',');
      });
      res.send(movies);
    });
  });

  app.get('/movies/:pk', function(req, res) {
    db.all('SELECT * FROM movie WHERE pk=$1', [req.params.pk], function(err, rows) {
      if (err) throw err;
      var movie = rows[0];
      if (movie.genre_fks)
        movie.genre_fks = movie.genre_fks.split(',');
      res.send(movie);
    });
  });

  app.put('/movies/:pk', function(req, res) {
    var movie = req.body;
    if (movie.genre_fks)
      movie.genre_fks = movie.genre_fks.join(',');
    db.run('UPDATE movie SET name=$1, genre_fks=$2 WHERE pk=$3', [movie.name, movie.genre_fks, req.params.pk], function(err) {
      if (err) throw err;
      res.send(movie);
    });
  });

  app.post('/movies', function(req, res) {
    var movie = req.body;
    if (movie.genre_fks)
      movie.genre_fks = movie.genre_fks.join(',');
    movie.pk = createUUID();
    db.run('INSERT INTO movie (pk, name, genre_fks) VALUES ($1, $2, $3)', [movie.pk, movie.name, movie.genre_fks], function(err) {
      if (err) throw err;
      res.send(movie);
    });
  });

  app.delete('/movies/:pk', function(req, res) {
    db.run('DELETE FROM movie WHERE pk=$1', [req.params.pk], function(err) {
      if (err) throw err;
      // jQuery interprets it as an error if we don't return JSON
      res.send({'deleted': true});
    });
  });

  app.delete('/movies', function(req, res) {
    db.run('DELETE FROM movie', function(err) {
      if (err) throw err;
      // jQuery interprets it as an error if we don't return JSON
      res.send({'deleted': true});
    });
  });

  app.use(express.static(__dirname + '/public'));

  app.listen(3000);
});


function setupDatabase(callback) {
  db = new sqlite3.Database('movies.sqlite', function(err) {
    if (err)
      throw err;

    db.all("SELECT name FROM sqlite_master WHERE type='table'", function(err, rows) {
      if (err) throw err;
      var tablenames = _.pluck(rows, 'name');

      // if the database schema is already setup; short-circuit
      if (_.contains(tablenames, 'movie') && _.contains(tablenames, 'genre'))
        return callback();

      // Note: both the table creation & population below are DRY violations that a code review would catch
      //   Normally we would write these as a callback loop via async.forEach() or generators
      //   but for the sake of simplicity, I'm leaving them as nested callbacks

      // else create the 2 tables we need
      db.run('CREATE TABLE movie (pk varchar(32) PRIMARY KEY, name varchar(255), genre_fks varchar(255))', function(err) {
        if (err) throw err;
        db.run('CREATE TABLE genre (pk varchar(32) PRIMARY KEY, name varchar(100))', function(err) {
          if (err) throw err;

          // & populate the genres table
          db.run('INSERT INTO genre (pk, name) VALUES ($1, $2)', [createUUID(), 'Action & Adventure'], function(err) {
            if (err) throw err;
            db.run('INSERT INTO genre (pk, name) VALUES ($1, $2)', [createUUID(), 'Kids & Family'], function(err) {
              if (err) throw err;
              db.run('INSERT INTO genre (pk, name) VALUES ($1, $2)', [createUUID(), 'Sci-Fi & Fantasy'], function(err) {
                if (err) throw err;
                callback();
              });
            });
          });
        });
      });
    });
  });
}

function createUUID() {
  return uuid.v4().replace(/-/g, '');
}