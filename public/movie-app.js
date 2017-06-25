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
});