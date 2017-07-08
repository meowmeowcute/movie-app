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
            'click form #submit-movie.add': 'createMovie',
            'click form #submit-movie:not(.add)': 'saveMovie',
            'click .delete': 'deleteMovie',
            'click .edit': 'editMovie',
            'click #cancel': 'resetForm'
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
                this.resetForm();
            }
        },

        editMovie: function(e) {
            e.preventDefault();

            var $elem = $(e.target).parents("article");
            var id = $elem.attr("id");

            var movie = this.collection.get(id);

            this.$el.find('#movie-form #movie-name').val(movie.attributes.name);
            this.$el.find('#movie-form #movie-genre').val(movie.attributes.genre_fks);
            this.$el.find('#movie-form #movie-id').val(id);
            this.setFormMode('edit');
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

        saveMovie: function(e) {
            e.preventDefault();
            var id = $("#movie-id").val();

            var formData = {};
            formData.name = this.$el.find('#movie-form #movie-name').val();
            formData.genre_fks = [];

            var genres = this.$el.find('#movie-form #movie-genre').val();
            _.each(genres, function(item, index, list) {
                formData.genre_fks.push(item);
            });

            if (this.validateMovie(formData)) {
                var self = this;
                var movie = this.collection.get(id);
                movie.set({'name': formData.name});
                movie.set({'genre_fks': formData.genre_fks});
                movie.save(null, {'success': function() {
                    self.initialize();
                }});
            }

            this.resetForm();
        },

        populateGenreSelector: function() {
            var genreSelector = this.$el.find('#movie-genre');
            $(genreSelector).html("");
            _.each(this.genres.models, function(item, index, list) {
                var option = $('<option/>', {
                    value: item.attributes.pk,
                    text: item.attributes.name
                }).appendTo(genreSelector);
            });
        },

        validateMovie: function(formData) {
            if (formData.name === "") {
                alert("Please enter movie name");
                return false;
            }
            return true;
        },

        setFormMode: function(mode) {
            var form = $('#movie-form');

            $(form).find("#form-mode").val(mode);
            if (mode === 'add') {
                $('button#submit-movie').text('Submit').addClass('add');
                $(form).find("h3").text('Add movie');
            }
            if (mode === 'edit') {
                $('button#submit-movie').text('Save').removeClass('add');
                $(form).find("h3").text('Edit movie');
            }
        },

        resetForm: function() {
            this.setFormMode('add');
            $('#movie-form')[0].reset();
        }
    });

    var movieList = new MovieList();
    Backbone.history.start();

});