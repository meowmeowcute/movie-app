var Movie = Backbone.Model.extend({
  'urlRoot': '/movies',
  'idAttribute': 'pk'
});

var Movies = Backbone.Collection.extend({
  'url': '/movies',
  'model': Movie
});

$(document).ready(function() {
    // Backbone App setup here
    //define individual movie view
    var MovieView = Backbone.View.extend({
      tagName: "article",
      classname: "movie",
      template: _.template($("#movieTemplate").html()),

      render: function() {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
      }
    });

    var MovieList = Backbone.View.extend({
        el: $("#movies"),

        initialize: function() {
          var self = this;
          this.collection = new Movies([]);
          this.collection.fetch({
              success: function(collection,response,options) {
                  self.render();
              }
          });
        },

        render: function() {
          this.$el.find("article").remove();
          _.each(this.collection.models, function(item, index, list) {
            this.renderMovie(item);
          }, this);
        },

        renderMovie: function(item) {
          var movieView = new MovieView({
              model: item
          });

          this.$el.append(movieView.render().el);
        }
    });

    var movieList = new MovieList();
    Backbone.history.start();

});