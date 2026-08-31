var $ = Dom7;


var app = new Framework7({
  name: 'Bible Partner', // App name
  theme: 'md', // auto for Automatic theme detection
  darkMode: true,
  el: '#app', // App root element

  // Enable swipe panel
  panel: {
    swipe: true,
    swipeOnlyClose: true,
  },

  // App store
  store: store,

  // App routes
  routes: routes,

  on: {
    init: function () {
      console.log('App initialized');

      //Load Books
      BIBLE.loadBooks();

      //Load Topics
      TOPICS.loadTopics();

      //Load bookmarks
      BOOKMARKS.loadBookmarks();

    },
    pageInit: function () {
      // console.log('Page initialized');
    },
  }
});

// Login Screen Demo
$('#my-login-screen .login-button').on('click', function () {
  var username = $('#my-login-screen [name="username"]').val();
  var password = $('#my-login-screen [name="password"]').val();

  // Close login screen
  app.loginScreen.close('#my-login-screen');

  // Alert username and password
  app.dialog.alert('Username: ' + username + '<br/>Password: ' + password);
});

//BIBLE

$(".panel-bible").on("click", ".btn-book", function(e){

  let bookId = parseInt($(this).data('id'));

  //will show the chapters' book.
  BIBLE.loadChapters(bookId);

});

$(".panel-bible").on("click", ".chapters-box .btn-chapter", function(e){

  let bookId = $(this).data('book');
  let source = $(this).data('source');
  let chapter = $(this).text();

  //will show the chapters' book.
  BIBLE.showChapter(bookId, chapter, source);

});

$(".panel-bible").on("click", ".btn-bible-sections", function(e){

  let section = $(this).data("section");

  BIBLE.loadSection(section);
});

//TOPICS

$("#view-topics").on("click", ".sub-topic-texts a", async function(e){

  let jsonText = JSON.parse($(this).data("verse"));

  BIBLE.showVerseInBible(jsonText);

});

//BOOKMARKS

$("#view-bible").on("click", ".file-content-view .verse-link", function(e){

  let verse = $(this).text();
  let book = $(".title.title-view-center-main").data("book");
  let chapter = $(".title.title-view-center-main").data("chapter");

  BOOKMARKS.showFormNewBookmark(book, chapter, verse);
});

$("#pp-form-bookmark").on("click", ".btn-save-bookmark", function(e){

  BOOKMARKS.saveBookmark();

});

$(".bookmarks-box").on("click", ".item-link", function(e){

  let jsonText = JSON.parse($(this).data('text'));

  //Close bookmark panel
  app.panel.close(".panel-bookmarks");

  BIBLE.showVerseInBible(jsonText);
});

$(".bookmarks-box").on("swipeout:deleted", ".swipeout", function(e){

  BOOKMARKS.deleteBookmark($(this).data("bmId"));

});


