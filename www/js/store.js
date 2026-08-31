

var createStore = Framework7.createStore;
const store = createStore({
  state: {
    books: [], //Dinamic load from file
    topics: [], //Dinamic load from file
    bookmarks: [], //Dinamic load from file
    MBsearchBar: false,
    config:{},
    configTemplate:
    {
      "theme":{
        "value": 'dark' //dark - light
      },
      "fontSize":{
        "value": 16
      }
    }
  },
  getters: {
    topics({ state }) {
      return state.topics;
    },
    books({ state }) {
      return state.books;
    },
    bookmarks({ state }) {
      return state.bookmarks;
    },
    config({ state }) {
      return state.config;
    }
  },
  actions: {
    addBooks({ state }, booksList){
      state.books = booksList;
    },
    addTopics({ state }, topicsList) {
      state.topics = topicsList;
    },
    loadBookmarks({ state }, bookmarksList) {
      state.bookmarks = bookmarksList;
    },
    addBookmark({ state }, bookMark) {
      state.bookmarks = [...state.bookmarks, bookMark];
    },
    deleteBookmark({ state }, indexBm){
      state.bookmarks.splice(indexBm, 1);
    },
    updateConfig({ state }, configValue){
      //console.log(configValue[0], configValue[1]);
      state.config[configValue[0]].value = configValue[1];
    }
  },
});

