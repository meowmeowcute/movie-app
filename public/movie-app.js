var Movie = Backbone.Model.extend({
  'urlRoot': '/movies',
  'idAttribute': 'pk'
});

var Movies = Backbone.Collection.extend({
  'url': '/movies',
  'model': Movie
});

var Genre = Backbone.Model.extend({
    'urlRoot': '/genres',
    'idAttribute': 'pk'
});

var Genres = Backbone.Collection.extend({
    'url': '/genres',
    'model': Genre
});

$(document).ready(function() {
    // Backbone App setup here
    //define individual movie view
    var MovieView = Backbone.View.extend({
      tagName: 'article',
      classname: 'movie',
      template: _.template($('#movieTemplate').html()),

      render: function() {
        var model = this.model.toJSON();
        this.$el.html(this.template(model));
        this.$el.attr('id', model.pk);
        return this;
      }
    });

    var MovieList = Backbone.View.extend({
        el: $('#movies'),

        events: {
            'click #submit-movie': 'createMovie',
            'click .delete': 'deleteMovie'
        },

        initialize: function() {
          var self = this;

          this.genres = new Genres();
          this.genres.fetch({
            success: function(collection,response,options) {
                  self.populateGenreSelector();
                  self.collection = new Movies([]);
                  self.collection.fetch({
                    success: function(collection,response,options) {
                        self.render();
                    }
                  });
            }
          });
        },

        render: function() {
          this.$el.find('article').remove();
          _.each(this.collection.models, function(item, index, list) {
            this.renderMovie(item);
          }, this);
        },

        renderMovie: function(item) {
          var genres = [];
          var self = this;

          _.each(item.attributes.genre_fks, function(item, index, list) {
              var genre = self.genres.get(item);
              genres[item] = genre.attributes.name;
          });
          item.attributes.genres = genres;
          var movieView = new MovieView({
              model: item
          });

          this.$el.append(movieView.render().el);
        },

        createMovie: function(e) {
            e.preventDefault();

            var formData = {};
            formData.name = this.$el.find('#movie-form #movie-name').val();
            formData.genre_fks = [];

            var genres = this.$el.find('#movie-form #movie-genre').val();
            _.each(genres, function(item, index, list) {
                formData.genre_fks.push(item);
            });

            if (this.validateMovie(formData)) {
                var self = this;
                var movie = new Movie({
                    'name': formData.name,
                    'genre_fks' : formData.genre_fks
                });
                movie.save(null, {'success': function() {
                    self.initialize();
                }});
                $('#movie-form')[0].reset();
            } else {
                alert("Please enter movie name");
            }
        },

        deleteMovie: function(e) {
            e.preventDefault();

            var $elem = $(e.target).parents("article");
            var id = $elem.attr("id");

            var movie = this.collection.get(id);
            $elem.remove();

            movie.destroy({'success': function() {
                alert("movie deleted!");
            }, 'error': function() {
                alert("movie not found");
            }});


        },

        populateGenreSelector: function() {
            var genreSelector = this.$el.find('#movie-genre');
            _.each(this.genres.models, function(item, index, list) {
                var option = $('<option/>', {
                    value: item.attributes.pk,
                    text: item.attributes.name
                }).appendTo(genreSelector);
            });
        },

        validateMovie: function(formData) {
            if (formData.name === "") {
                return false;
            }
            return true;
        }
    });

    var movieList = new MovieList();
    Backbone.history.start();

});