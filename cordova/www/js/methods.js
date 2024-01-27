const S_HOST = window.document.location.origin;

const APP_METHODS = {
    onBackKeyDown() {

        var leftp = app.panel.get(".panel-left") && app.panel.get(".panel-left").opened;
        var rightp = app.panel.get(".panel-right") && app.panel.get(".panel-right").opened;

        if (leftp || rightp) {

            app.panel.close();
            return false;
        } else if ($('.modal-in').length > 0) {

            app.dialog.close();
            app.popup.close();
            return false;
        } else if (app.views.current.router.url == '/home/') {

            navigator.app.exitApp();
        } else {
            app.tab.show("#view-home", true);
        }

    },
    applyAppConfigInterface(){
        if(store.state.config.theme.value == "dark"){
            $("#view-settings .config-darkmode").prop("checked", true);
            app.setDarkMode(true);
        }else{
            $("#view-settings .config-darkmode").prop("checked", false);
            app.setDarkMode(false);
        }

        $(".file-content-view").css("font-size", store.state.config.fontSize.value+"px");
        $("#view-topics").css("font-size", store.state.config.fontSize.value+"px");
        app.range.setValue("#view-settings .range-slider", store.state.config.fontSize.value);
    }

}

const BIBLE = {
    async loadSection(section) {

        let path = "";

        switch (section) {
            case 'front':
                source = "1001061100_1.xhtml";
                navTitle = "Portada";
                break;
            case 'editors':
                source = "1001061101.xhtml";
                navTitle = "Editores";
                break;
            case 'prologue':
                source = "1001061102.xhtml";
                navTitle = "Prólogo";
                break;
        }

        let content = await WEB_SOURCES.loadFile(`${S_HOST}/data/bible_es/intro/${source}`, "section");

        //Collapse navbar
        app.navbar.collapseLargeTitle(".main-navbar");

        //Set title for center main view
        $(".title-view-center-main, .title-view-center-main-alt").text(navTitle);

        //load content into chapter view
        $(".file-content-view").html(content);

        //Scroll to top
        $(".page-wrapper-view").scrollTo(0, 0, 0);

        //close the panel
        app.panel.close(".panel-bible");

    },
    loadBooks() {

        //Load Books
        WEB_SOURCES.loadFile(`${S_HOST}/data/books.json`, "json").then((booksList) => {

            app.store.dispatch('addBooks', booksList).then(() => {

                console.log("Books added to store");

                let booksList = store.getters.books.value;
                let htmlTempList = "";
                let htmlListAt = "";
                let htmlListNt = "";

                booksList.map((book) => {

                    if (book.id == 1 || book.id == 40) { //If Residue is 1, add new start grid
                        htmlTempList += `<div class="grid grid-cols-2 grid-min-gap">`;
                    }

                    htmlTempList += `<a href='/panel-chapters/' data-view='current' class="button button-fill btn-book bt-tone-${book.tone}" data-id="${book.id}">${book.title}</a>`;

                    if (book.id == 39 || book.id == 66) { //If Residue is 0, add end grid
                        htmlTempList += `</div>`;
                    }

                    if (book.id <= 39) {
                        htmlListAt += htmlTempList;
                    } else {
                        htmlListNt += htmlTempList;
                    }

                    htmlTempList = "";

                });


                //add htmlList to Side Left Panel

                $(".block-book-list.list-at").html(htmlListAt);
                $(".block-book-list.list-nt").html(htmlListNt);
            });

        });

    },
    loadChapters(bookId) {

        let indexBook = (bookId - 1);
        let chapters = store.getters.books.value[indexBook].chapters;
        let bookTitle = store.getters.books.value[indexBook].title;
        let htmlChapters = "";
        let chapterSource = "";
        let bookSourceId = 0;

        //Title for top chapters panel
        $(".title.book-title").text(bookTitle);

        //Generate chapters
        for (let index = 1; index <= chapters; index++) {

            bookSourceId = ('0000' + (bookId + 4)).slice(-2);

            if (index == 1) {
                chapterSource = `10010611${bookSourceId}.xhtml`;
            } else {
                chapterSource = `10010611${bookSourceId}-split${index}.xhtml`;
            }

            htmlChapters += `<button class='button button-fill btn-chapter' data-book='${bookId}' data-source='${chapterSource}'>${index}</button>`;
        }

        $(".chapters-box .grid").html(htmlChapters);
    },
    getBookInfo(bookId) {
        return store.getters.books.value[(bookId - 1)];
    },
    async showChapter(bookId, chapter, source) {

        let indexBook = (bookId - 1);
        let bookTitleMin = store.getters.books.value[indexBook].title.substring(0, 22);

        if (store.getters.books.value[indexBook].title.length != bookTitleMin.length) {

            bookTitleMin += "...";
        }

        //Set title for center main view
        $(".title-view-center-main").text(`${bookTitleMin} ${chapter}`);
        $(".title-view-center-main").data("book", bookId);
        $(".title-view-center-main").data("chapter", chapter);

        //close the panel
        app.panel.close(".panel-bible");

        //show content bible tab
        app.tab.show("#view-bible", true);

        //load the source content chapter
        await this.loadContentChapter(source);
    },
    async loadContentChapter(source) {

        let content = await WEB_SOURCES.loadFile(`${S_HOST}/data/bible_es/chapters/${source}`, "chapter");

        //load content into chapter view
        $(".file-content-view").html(content);

        //Scroll to top
        $(".page-wrapper-view").scrollTo(0, 0, 0);
    },
    scrollToVerse(chapter, verse, cleanOldHighLights = true) { //BIBLE.scrollToVerse(1, 10); OR BIBLE.scrollToVerse(1, [1,2,3]);

        if (cleanOldHighLights) {
            //clean old highlight verses
            $(".file-content-view .highlighted-verse").removeClass("highlighted-verse");
        }

        //validate if verse is complex
        if (typeof verse === "string") {

            //calculate verseList
            let verseRange = verse.split("-").map(Number);
            let verseList = [];

            for (let index = verseRange[0]; index <= verseRange[1]; index++) {
                verseList.push(index);
            }

            //Recursive call
            let firstComplexVerseHL = true;
            verseList.map((UniVerse) => {
                this.scrollToVerse(chapter, UniVerse, false);

                //Scrolling for first verse from group
                if (firstComplexVerseHL) {
                    let verseId = document.querySelector(`#chapter${chapter}_verse${UniVerse}`);
                    //scrolling
                    verseId.scrollIntoView({
                        behavior: 'smooth',
                        block: "center"
                    });

                    firstComplexVerseHL = false;
                }
            });

            return false;

        } else if (typeof verse === "number") {

            let verseId = document.querySelector(`#chapter${chapter}_verse${verse}`);
            let parentPar = verseId.parentElement;
            let nodeIndexVerse = Array.from(parentPar.childNodes).indexOf(verseId);

            if (cleanOldHighLights) { //if cleanOldHL its true we need do scrolling
                //scrolling
                verseId.scrollIntoView({
                    behavior: 'smooth',
                    block: "center"
                });
            }

            //highlight verse
            let verseText = parentPar.childNodes[(nodeIndexVerse + 2)].textContent.trim();
            let highlight = '<span class="highlighted-verse">' + verseText + '</span>';

            $(parentPar).html($(parentPar).html().replace(verseText, highlight));

            //Now read next paragraphs if has class sz
            let pNext = parentPar.nextElementSibling;

            if(pNext != null){
                let pOk = true;
                let spanTag = null;

                while (pOk) {

                    if(pNext.classList.contains("sz")){
                        //if contains sz class, let's highlight text verse
                        verseText = pNext.textContent.trim();
                        highlight = '<span class="highlighted-verse">' + verseText + '</span>';
                        $(pNext).html($(pNext).html().replace(verseText, highlight));
        
                        pNext = pNext.nextElementSibling;
                        
                    }else if(pNext.classList.contains("sb") || pNext.classList.contains("sl")){

                        spanTag = pNext.getElementsByTagName('span');

                        if(spanTag.length == 0){ //Exists span tag then exit while and NO highlight text verse
                            verseText = pNext.textContent.trim();
                            highlight = '<span class="highlighted-verse">' + verseText + '</span>';
                            $(pNext).html($(pNext).html().replace(verseText, highlight));

                            pNext = pNext.nextElementSibling;

                        }else{
                            pOk = false;
                        }
                    }

                    if(pNext == null){
                        pOk = false;
                    }
                }
            }
        }
    },
    async showVerseInBible(jsonText) {

        let bookId = jsonText.book;
        let chapter = jsonText.chapter;
        let verse = jsonText.verse;
        let chapterSource = "";

        let bookSourceId = ('0000' + (bookId + 4)).slice(-2);

        if (chapter == 1) {
            chapterSource = `10010611${bookSourceId}.xhtml`;
        } else {
            chapterSource = `10010611${bookSourceId}-split${chapter}.xhtml`;
        }

        await this.showChapter(bookId, chapter, chapterSource);

        this.scrollToVerse(chapter, verse);

    }
}

const TOPICS = {
    async loadTopics() {

        WEB_SOURCES.loadFile(`${S_HOST}/data/topics.json`, "json").then((topicsList) => {

            app.store.dispatch('addTopics', topicsList).then(() => {
                console.log('Topics added to store');

                //Initializing topics view
                app.views.create('#view-topics', {
                    url: '/topics/'
                })

            });

        });
    }
}

const BOOKMARKS = {
    // async loadBookmarks() { // DESUSO
    //     WEB_SOURCES.loadFile(`${S_HOST}/data/bookmarks.json`, "json").then((bookmarksList) => {

    //         app.store.dispatch('loadBookmarks', bookmarksList).then(() => {
    //             console.log('Bookmarks added to store');

    //             //show bookmarks list
    //             BOOKMARKS.showBookmarksList();

    //         });

    //     });
    // },
    showBookmarksList() {

        let bookmarks = store.getters.bookmarks.value;
        let htmlBookmarks = "";
        if (bookmarks.length > 0) {

            bookmarks.map((bookmark, index) => {
                htmlBookmarks += `  <li class="swipeout" data-bmid="${bookmark._id}">
                                        <div class="swipeout-content">
                                            <a class="item-link item-content" data-text='{"book": ${bookmark.text.book}, "chapter": ${bookmark.text.chapter}, "verse": ${bookmark.text.verse}}'>
                                                <div class="item-media">
                                                    <i class="icon f7-icons if-not-md">bookmark</i>
                                                    <i class="icon material-icons if-md">bookmark_border</i>
                                                </div>
                                                <div class="item-inner">
                                                    <div class="item-title-row">
                                                    <div class="item-title">${bookmark.title}</div>
                                                    <div class="item-after">${store.getters.books.value[(bookmark.text.book - 1)].abbr} ${bookmark.text.chapter}:${bookmark.text.verse}</div>
                                                    </div>
                                                    <!-- <div class="item-subtitle">Subtitle</div> -->
                                                    <div class="item-text">${bookmark.description}</div>
                                                </div>
                                            </a>
                                        </div>
                                        <div class="swipeout-actions-right">
                                            <a href="#" class="swipeout-delete">Borrar</a>
                                        </div>
                                    </li>`;


            });

            $(".text-no-bookmarks").hide();
        } else {
            $(".text-no-bookmarks").show();
        }

        $(".bookmarks-box").html(htmlBookmarks);

        if (store.state.MBsearchBar === false) {
            //Init searchBar
            store.state.MBsearchBar = app.searchbar.create({
                el: ".bookmark-search",
                searchContainer: ".bookmarks-box",
                searchIn: ".item-title, .item-text",
                notFoundEl: ".text-search-no-found"
            });
        }

    },
    showFormNewBookmark(bookId, chapter, verse) {
        console.log(bookId, chapter, verse);

        let bookInfo = BIBLE.getBookInfo(bookId);

        // $("#pp-new-bookmark .navbar .title").text("Nuevo marcador");
        $("#pp-form-bookmark .full-verse").text(`${bookInfo.title} ${chapter}:${verse}`);
        $('#form-bookmark [name="bm-verse"]').val(`{"book": ${bookId}, "chapter": ${chapter}, "verse": ${verse}}`);

        app.popup.open("#pp-form-bookmark");
    },
    saveBookmark() {
        //Get values
        let bmTitle = $('#form-bookmark [name="bm-title"]');
        let bmDescription = $('#form-bookmark [name="bm-description"]');
        let bmVerse = $('#form-bookmark [name="bm-verse"]');
        let timestampId = Date.now();

        //validate input
        if (app.input.validate(bmDescription)) {

            //save new bookmark in store
            app.store.dispatch('addBookmark', { "_id": timestampId, "title": bmTitle.val(), "description": bmDescription.val(), "text": JSON.parse(bmVerse.val()) });

            //Update bookmarks file
            LOCAL_SOURCES.updateBookmarksFile(null, 1);

            //clear inputs
            bmTitle.val('');
            bmDescription.val('');
            bmVerse.val('');

            //Close popup
            app.popup.close("#pp-form-bookmark");

            //refresh bookmark list
            BOOKMARKS.showBookmarksList();
        }
    },
    deleteBookmark(bmId) {


        let bookmarks = store.getters.bookmarks.value;
        let bookmarkLength = bookmarks.length;

        bookmarks.forEach((bookmark, index) => {

            if (bookmark._id == bmId) {
                app.store.dispatch('deleteBookmark', index);

                //Update bookmarks file
                LOCAL_SOURCES.updateBookmarksFile(null, 1);
            }
        });

        if (bookmarkLength == 1) { //Already deleted

            //refresh bookmark list
            BOOKMARKS.showBookmarksList();
        }
    }
}

const WEB_SOURCES = {
    async loadFile(path, type) {

        let textData = "";

        await fetch(path)
            .then(r => r.text())
            .then(t => {
                textData = this.openFile(t, type);
            });

        // let reader = new FileReader();

        // reader.onload = this.openFile;
        // content = reader.readAsText(path);

        return textData;
    },
    openFile(content, type) {

        contentFile = "";

        if (type == undefined) {
            console.error("File type is undefined");
            return false;
        }

        if (type == "chapter") {

            let parser = new DOMParser();
            let xmlContent = parser.parseFromString(content, 'text/xml');

            if (xmlContent != null) {
                //Delete optional sections
                $(xmlContent).find("header").remove();
                $(xmlContent).find(".w_navigation").remove();
                $(xmlContent).find(".w_navigation").remove();
                $(xmlContent).find(".groupFootnote").remove();
                $(xmlContent).find("span[id^=footnotesource").remove();
                $(xmlContent).find("a").remove();

                //modify sup class
                $(xmlContent).find("sup").addClass("verse-link");
                $(xmlContent).find(".w_ch>strong").addClass("verse-link");
            }

            let bodyContent = xmlContent.getElementsByTagName('body');

            if (bodyContent.length > 0) {

                contentFile = bodyContent[0].innerHTML;

                //remove &nbsp symbol;
                contentFile = contentFile.replace(/strong>\xa0/g, 'strong>');
                contentFile = contentFile.replace(/span>\xa0/g, 'span>');
                contentFile = contentFile.replace(/\xa0/g, ' ');

            }
        }

        if (type == "section") {

            let parser = new DOMParser();
            let xmlContent = parser.parseFromString(content, 'text/xml');

            if (xmlContent != null) {

                //Replace links with span tags
                let anchors = xmlContent.querySelectorAll("a");
                for (let i = 0; i < anchors.length; i++) {
                    let span = xmlContent.createElement("span");
                    span.innerHTML = anchors[i].innerHTML;
                    anchors[i].parentNode.replaceChild(span, anchors[i]);
                }
            }

            let bodyContent = xmlContent.getElementsByTagName('body');

            if (bodyContent.length > 0) {

                contentFile = bodyContent[0].innerHTML;

            }

        }

        if (type == "json") {
            contentFile = JSON.parse(content);
        }

        return contentFile;
    },
    loadDailyText(){
        // WARNING: For GET requests, body is set to null by browsers.
        let data = "";

        let xhr = new XMLHttpRequest();
        xhr.withCredentials = true;

        xhr.addEventListener("readystatechange", function() {
        if(this.readyState === 4) {
            console.log(this.responseText);
        }
        });

        xhr.open("GET", "https://wol.jw.org/es/wol/h/r4/lp-s/2024/1/20");

        xhr.send(data);
    }

}

var LOCAL_SOURCES = { //change to cons after developing complete

    checkInitConfigFiles() {

        //Init FileSystem
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onSuccessFS, onErrorFS);

        function onSuccessFS(fs) {

            fs.root.getDirectory("appData", { create: true, exclusive: true },
                function () {
                    console.log("appData Created");

                    //creating config file
                    createConfigFile(fs);

                    //creating bookmarks file
                    createBookMarksFile(fs);

                }, function () {
                    console.log("appData already exists");

                    //check if config file was create
                    createConfigFile(fs);

                    //check if bookmark file was create
                    createBookMarksFile(fs);

                });

        }

        function createConfigFile(fs) {

            fs.root.getFile('appData/config_ini.sam', { create: true, exclusive: true },
                function () {

                    console.log('Config file created');

                    //Writing Config file
                    LOCAL_SOURCES.updateConfigFile(fs, 0);

                },
                function () {
                    console.log('Config file already exists');

                    //lets read config file
                    LOCAL_SOURCES.loadConfigFile();
                });

        }

        function createBookMarksFile(fs){
            fs.root.getFile('appData/bookmarks.sam', { create: true, exclusive: true },
                function () {

                    console.log('Bookmarks file created');

                    //Writing Config file
                    LOCAL_SOURCES.updateBookmarksFile(fs, 0);

                },
                function () {
                    console.log('Bookmarks file already exists');

                    //lets read config file
                    LOCAL_SOURCES.loadBookmarksFile();
                });

        }

        function onErrorFS(err) {
            console.log(err);
        }
    },
    loadConfigFile(chargeConfig = true) {

        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function onFileSystemSuccess(fileSystem) {

            var configFilePath = fileSystem.root.toURL() + "appData/config_ini.sam";

            window.resolveLocalFileSystemURL(configFilePath, function (fileEntry) {

                fileEntry.file(function (file) {
                    var reader = new FileReader();

                    reader.onloadend = function (e) {

                        data = "" + this.result;

                        if (chargeConfig) {
                            store.state.config = JSON.parse(data);

                            //Set controls form in page settings
                            APP_METHODS.applyAppConfigInterface();                            
                        }
                    }

                    reader.readAsText(file);
                });

            }, function (err) {
                console.log(err);
            });

        });

    },
    updateConfigFile(fs, data) {

        if (fs == null) {

            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {

                writeConfigFile(fs, data);

            }, function (err) {
                console.log(err);
            });

        } else {
            writeConfigFile(fs, data);
        }

        function writeConfigFile(fs, data) { // 0 = configTemplate, 1 = config, another value = string to save

            let stringData = '';

            if (data == 0) {
                stringData = JSON.stringify(store.state.configTemplate);
            } else if (data == 1) {
                stringData = JSON.stringify(store.state.config);
            } else {
                stringData = data.toString();
            }

            fs.root.getFile("appData/config_ini.sam", { create: true, exclusive: false }, function (fileEntry) {

                fileEntry.createWriter(function (writer) {
                    //start writing
                    writer.write(stringData);

                    //console.log(stringData);
                    //load Config file
                    LOCAL_SOURCES.loadConfigFile();

                }, function () {
                    console.log('Error writing config file');
                });

            }, function () {
                console.log('Error acceding to config file');
            });

        }

    },
    loadBookmarksFile(chargeBookmarks = true) {

        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function onFileSystemSuccess(fileSystem) {

            var configFilePath = fileSystem.root.toURL() + "appData/bookmarks.sam";

            window.resolveLocalFileSystemURL(configFilePath, function (fileEntry) {

                fileEntry.file(function (file) {
                    var reader = new FileReader();

                    reader.onloadend = function (e) {

                        data = "" + this.result;

                        if (chargeBookmarks) {
                            app.store.dispatch('loadBookmarks', JSON.parse(data)).then(() => {
                                
                                //console.log('Bookmarks added to store');
                                //show bookmarks list
                                BOOKMARKS.showBookmarksList();
                
                            });
                        }
                    }

                    reader.readAsText(file);
                });

            }, function (err) {
                console.log(err);
            });

        });

    },
    updateBookmarksFile(fs, data) {

        if (fs == null) {

            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {

                writeBookmarksFile(fs, data);

            }, function (err) {
                console.log(err);
            });

        } else {
            writeBookmarksFile(fs, data);
        }

        function writeBookmarksFile(fs, data) { // 0 = {}, another value = string to save

            let stringData = '';

            if (data == 0) {
                stringData = '[]';
            } else if(data == 1){
                stringData = JSON.stringify(store.state.bookmarks);
            } else {
                stringData = data.toString();
            }

            fs.root.getFile("appData/bookmarks.sam", { create: true, exclusive: false }, function (fileEntry) {

                fileEntry.createWriter(function (writer) {
                    //start writing
                    writer.write(stringData);

                    //load Config file
                    LOCAL_SOURCES.loadConfigFile();

                }, function () {
                    console.log('Error writing bookmarks file');
                });

            }, function () {
                console.log('Error acceding to bookmarks file');
            });

        }

    },
    listDir(path) {
        window.resolveLocalFileSystemURL(path,
            function (fileSystem) {
                var reader = fileSystem.createReader();
                reader.readEntries(
                    function (entries) {
                        console.log(entries);
                    },
                    function (err) {
                        console.log(err);
                    }
                );
            }, function (err) {
                console.log(err);
            }
        );
    }
}