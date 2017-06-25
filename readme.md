# Purpose of Assignment

At the surface level, the assignment will show that you are self-directed, able to read & understand docs, google your problems and exercise your problem-solving skills to get things working.

But on a deeper level, the assignment is testing your ability to learn, understand and internalize a set of abstractions: Backbone models, collections and views. We prefer thin abstractions where possible (jQuery, underscore, node, etc), but sometimes it is useful to use thick abstractions, such as those Backbone provides.

This assignment shouldn't require hundreds of lines of code. The important thing isn't how much code you write -- or how good the final product is -- but rather how well you have internalized the concepts behind Backbone models, collections and views. Most of your time will likely be spent reading, playing with & gaining an understanding of Backbone, rather than writing a lot of lines of code. The purpose of the assignment is to give you a hands-on learning experience with Backbone and to provide a way to demonstrate your understanding.

# Setup Instructions

*Note: The below instructions assume Windows, but everything should work equally well on OS X or Linux, since these are all cross-platform technologies.*

* [Download](http://nodejs.org/download/) & install node 32-bit, if you haven't already (64-bit is ok, but we recommend 32-bit because it has fewer prerequisites for building native addon modules on Windows)
* `git clone https://github.com/CSNW/movie-app.git`
* `npm install` (this will pull down all dependencies)

# Run the Tests

In order to verify that everything was installed properly & is in working order, you should run the tests. The server tests can be run in node by typing `C:\movie-app\> npm test` from the root folder. The backbone model tests can be run in the browser by first firing up the server (`C:\movie-app\> node server.js`) and then navigating to `http://localhost:3000/tests.html` in a modern browser.

# Assignment

Included in this project is a simple movie server that uses a sqlite database to store lists of movies and associated genres.

Your assignment is to write a **movie list view** and a **movie item view**. The movie list view will contain a set of movie item views. You will want to read the Backbone docs and examples to learn how to do this in the most idiomatic way possible for Backbone and -- while you're doing it -- gain as much understanding of Backbone models, collections and views as possible.

The **movie item view** should:

* display the movie name & genres
* allow user to change the movie name
* allow user to change the list of genres associated with the movie
* allow user to delete the movie

The **movie list view** should:

* display the list of movies
* allow the user to create a new movie

# Tips

**Don't spend time making this pretty.** Though we typically use the Bootstrap CSS framework and strive for modern, clean UI designs, we would much prefer that you spend your limited time understanding and wrestling with Backbone instead of prettying things up with CSS. Naked, unstyled input text boxes and checkboxes are perfect for this assignment.

Spend time skimming, reading & internalizing the Backbone [docs](http://backbonejs.org/) and [annotated code](http://backbonejs.org/docs/backbone.html). Examples, tutorials and StackOverflow can be helpful, but nothing beats the docs and the code when you're trying to gain a thorough, authoritative understanding of a library.

You may run into an issue where a movie is not firing a change event or re-rendering or updating or saving when you add or remove a genre. This is because `movie.genre_fks` is an array -- since the Backbone Model just holds a reference to this array, it only knows if the array reference changes; it has no way of knowing if the contents of the array change. There are a number of ways to handle this, but the simplest is to just replace the whole array with a new one whenever you make changes, via cloning the old one, making any necessary changes and assigning it back, like this:

```javascript
var genre_fks = movie.get('genre_fks');
genre_fks = genre_fks.slice(); // .slice() is an idiomatic way to clone an array in JS
// add or remove items from the array here
movie.set('genre_fks', genre_fks);
```
