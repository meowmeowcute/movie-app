var expect = chai.expect;

// these are really just tests that the server API
// matches what Backbone expects, so that Backbone CRUD works
describe('movie app', function() {
  describe('model crud', function() {
    it('should create a model on the server', function(done) {
      var movie = new Movie({'name': 'Finding Nemo'});
      movie.save(null, {'success': function() {
        done();
      }});
    });

    it('should update a model on the server', function(done) {
      // first create the model
      var movie = new Movie({'name': 'Finding Nemo'});
      movie.save(null, {'success': function() {

        // now update it & save again
        movie.set({'name': 'Finding Dory'});
        movie.save(null, {'success': function(model, res) {
          expect(res.name).to.equal('Finding Dory');
          done();
        }});
      }});
    });


    it('should delete a model from the server', function(done) {
      // first create the model
      var movie = new Movie({'name': 'Finding Nemo'});
      movie.save(null, {'success': function() {
        var movie_pk = movie.id;

        // now delete it
        movie.destroy({'success': function() {
          done();
        }, 'error': function() {
          debugger;
        }});
      }});
    });

    it('should pull a specific model from the server', function(done) {
      // first create the model
      var movie = new Movie({'name': 'Finding Nemo'});
      movie.save(null, {'success': function() {
        var movie_pk = movie.id;

        // now pull it from the server
        var new_instance = new Movie({'pk': movie_pk});
        new_instance.fetch({'success': function() {
          setTimeout(function() {
            expect(new_instance.get('name')).to.equal('Finding Nemo');
            done();  
          }, 50);          
        }});
      }});
    });
  });

  describe('collection populate', function() {
    it('should load all movies', function(done) {
      // create a movie
      var movie = new Movie({'name': 'Finding Nemo'});
      movie.save(null, {'success': function() {
        var movie_pk = movie.id;

        // fetch movies from server & verify the newly-created movie is included
        var movies = new Movies();
        movies.fetch({'success': function() {
          expect(movies.get(movie_pk));
          done();
        }});
      }});
    });
  });
});