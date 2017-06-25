require('./server.js');
var request = require('request');
var expect = require('chai').expect;
var _ = require('underscore');

var url = 'http://localhost:3000';

describe('server', function() {

  var genres, action_adventure_pk, kids_family_pk;
  before(function(done) {
    // give the server time to spin up
    setTimeout(function() {

      // populate the genre info
      request.get(url + '/genres', function(err, res, body) {
        if (err) throw err;
        genres = JSON.parse(body);
        
        var act_adv = _.findWhere(genres, {'name': 'Action & Adventure'});
        expect(act_adv, 'A genre named "Action & Adventure" not found in DB.');
        action_adventure_pk = act_adv.pk;
        
        var kids_fam = _.findWhere(genres, {'name': 'Kids & Family'});
        expect(kids_fam, 'A genre named "Kids & Family" not found in DB.');
        kids_family_pk = kids_fam.pk;

        done();
      });
    }, 1000);
  });

  it('should list the 6 genres', function(done) {
    request.get(url + '/genres', function(err, res, body) {
      if (err) throw err;
      var genre_names = _.pluck(JSON.parse(body), 'name');
      genre_names.sort();
      expect(genre_names).to.deep.equal(['Action & Adventure', 'Kids & Family', 'Sci-Fi & Fantasy']);
      done();
    });
  });

  it('should create a new movie', function(done) {
    var movie = {'name': 'The Incredibles', 'genre_fks': [action_adventure_pk, kids_family_pk]};
    request.post({'url': url + '/movies', 'json': movie}, function(err, res) {
      if (err) throw err;
      expect(res.statusCode).to.equal(200);
      request.get(url + '/movies', function(err, res, body) {
        if (err) throw err;
        var names = _.pluck(JSON.parse(body), 'name');
        expect(names.indexOf('The Incredibles') > -1);
        done();
      });
    });
  });

  it('should delete all movies', function(done) {
    request.del(url + '/movies', function(err, res) {
      if (err) throw err;
      expect(res.statusCode).to.equal(200);
      request.get(url + '/movies', function(err, res, body) {
        if (err) throw err;
        expect(res.statusCode).to.equal(200);
        var movies = JSON.parse(body);
        expect(movies.length).to.equal(0);
        done();
      });
    });
  });

  it('should get a movie by pk', function(done) {
    // first create a movie
    var movie = {'name': 'The Incredibles', genre_fks: [action_adventure_pk, kids_family_pk]};
    request.post({'url': url + '/movies', 'json': movie}, function(err, res, body) {
      if (err) throw err;
      // the movie object (including the newly-generated movie pk) is returned
      var movie_url = '/movies/' + body.pk;

      request.get(url + movie_url, function(err, res, body) {
        var movie_data = JSON.parse(body);
        expect(movie_data.name).to.equal('The Incredibles');
        done();
      });
    });
  });

  it('should update a movie by pk', function(done) {
    // first create a movie
    var movie = {'name': 'The Incredibles', 'genre_fks': [action_adventure_pk, kids_family_pk]};
    request.post({'url': url + '/movies', 'json': movie}, function(err, res, body) {
      if (err) throw err;
      // the movie object (including the newly-populated movie pk) is returned
      var movie_url = '/movies/' + body.pk;

      // change the movie name & drop the kids/family genre
      var new_movie_data = {'name': 'Mr. Incredible', 'genre_fks': [action_adventure_pk]};
      request.put({'url': url + movie_url, 'json': new_movie_data}, function(err, res) {
        if (err) throw err;

        // verify the name has changed
        request.get(url + movie_url, function(err, res, body) {
          if (err) throw err;
          var movie_data = JSON.parse(body);
          expect(movie_data.name).to.equal('Mr. Incredible');
          // verify that the removal of the kids & family genre saved.
          expect(movie_data.genre_fks).to.deep.equal([action_adventure_pk]);
          done();
        });
      });
    });
  });
});