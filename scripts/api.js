const NYT_API = 'https://api.nytimes.com/svc/books/v3/';
const GOOGLE_API = "https://www.googleapis.com/books/v1/";

function loadBook() {
    const params = new URLSearchParams(document.location.search);
    const bookId = params.get('id');

    $.ajax({
        url: GOOGLE_API + `volumes?q=isbn:${bookId}`,
        type: 'GET',
        dataType: 'json',
        beforeSend: startLoading,
        complete: stopLoading,
        success: function(res) {
            displayBook(sanitizeBook(res));
        },
        error: function(request) {
            displayError(request.error);
        }
    }).then(() => {
        $(".desc").click(function(e) {
            e.preventDefault();
            $(this).toggleClass("desc-opened");
        });
    });
}

function loadBookList() {
    $.ajax({
        url: NYT_API + `lists/names.json?api-key=${config.API_KEY}`,
        type: 'GET',
        dataType: 'json',
        beforeSend: startLoading,
        complete: stopLoading,
        success: function(res) {
            displaySelect(sanitizeBookList(res));
        },
        error: function(request) {
            displayError(request.error);
        }
    })
}

function loadBooks(listName) {
    $.ajax({
        url: NYT_API + `lists/current/${listName}.json?api-key=${config.API_KEY}`,
        type: 'GET',
        dataType: 'json',
        beforeSend: startLoading,
        complete: stopLoading,
        success: function(res) {
            $('#list-name').text(res.results.list_name);
            $('#list-date').text(res.results.published_date);
            displayBooks(sanitizeBooks(res));
        },
        error: function(request) {
            displayError(request.error);
        }
    }).then(() => {
        loadFavoriteBooks();
    })
}

function loadFavoriteBooks() {
    $(".favorite").each(function() {
        // Check if was favorited
        let bookId = $(this).data("bookid");
        if (localStorage.getItem(bookId)) {
            $(this).toggleClass("favorited");
        }

        // Add click event
        $(this).click(function(e) {
            e.preventDefault();
            setFavorite($(this));
        });
    });
}

function setFavorite(element) {
    $(element).toggleClass("favorited");
    let bookId = $(element).data("bookid");
    if (localStorage.getItem(bookId)) {
        localStorage.removeItem(bookId);
    } else {
        localStorage.setItem(bookId, true);
    }
}

function startLoading() {
    $('.loading').show();
}

function stopLoading() {
    $('.loading').hide();
}

function displayError(status) {
    $('#bookList').empty();
    const p = $('<p class="error"><p>').text();
}

function displayBook(data) {

    $('#bookInfo').empty();
    const itemDiv = $(`<div class="row mt-5"></div>`);

    const colImage = $(`<div class="col-12 col-sm-4"></div>`);
    colImage.append($('<img class="w-100 rounded mb-4">').attr('src', data.image));
    itemDiv.append(colImage);

    const colInfo = $(`<div class="col-12 col-sm-8"></div>`);
    colInfo.append($('<h2 class="title"></h2>').text(data.title));
    colInfo.append($('<hr>'));

    const divCategories = $('<div class="div-info"></div>');
    divCategories.append($('<span class="small"></span>').text(`Categories`));
    divCategories.append($('<span></span>').text(data.categories));
    colInfo.append(divCategories);

    colInfo.append($('<hr>'));

    const divAuthor = $('<div class="div-info"></div>');
    divAuthor.append($('<span class="small"></span>').text(`Author`));
    divAuthor.append($('<span></span>').text(data.authors));
    colInfo.append(divAuthor);
    colInfo.append($('<hr>'));
    colInfo.append($('<div class="small mt-4"></div>').text("Description"));
    colInfo.append($(`<div class="desc" ><p class="mt-4 text-justify">${data.description}</p><div>`));

    const actions = $(`<div class="actions" ></div>`);
    const favorite = $(`<a href="" class="favorite" data-bookid="${data.id}" ></a>`);
    actions.append(favorite);
    colInfo.append($('<hr>'));
    const button = $('<div class="py-2"><a class="btn btn-warning d-block d-sm-inline-block" href="' + data.product_url + '" target="_blank">BUY BOOK &nbsp; <i class="fas fa-shopping-cart"></i></a></div>');
    actions.append(button);
    colInfo.append(actions);

    itemDiv.append(colInfo);

    $('#bookInfo').append(itemDiv);
}

function displaySelect(items) {
    (items).forEach((data) => {
        var option = new Option(data.name, data.id);
        $('#nameList').append(option)
    });
}

function displayBooks(items) {
    $('#bookList').empty();

    (items).forEach((data) => {
        const itemDiv = $(`<div id="${data.id}" class="book-item card card-body"></div>`).attr('id', data.id);

        const img = $('<img class="img-fluid">').attr('src', data.image)
        const bookLink = $(`<a href="book.html?id=${data.id}" ></a>`);
        bookLink.append(img);
        itemDiv.append(bookLink);

        const labelRank = $(`<div class="label-rank">${data.rank}</label>`);
        itemDiv.append(labelRank);

        const title = $('<h4 class="title"></h4>').text(data.title);
        itemDiv.append(title);

        const divAuthor = $('<div class="author"></div>');
        divAuthor.append($('<span class="small"></span>').text(`Authors`));
        divAuthor.append($('<span></span>').text(data.authors));
        itemDiv.append(divAuthor);

        const desc = $('<p class="desc"></p>').text(data.description);
        itemDiv.append(desc);

        const actions = $(`<div class="actions" ></div>`);
        const favorite = $(`<a href="" class="favorite" data-bookid="${data.id}" ></a>`);
        actions.append(favorite);
        const button = $('<a class="btn btn-warning d-block" href="' + data.product_url + '" target="_blank">BUY BOOK &nbsp; <i class="fas fa-shopping-cart"></i></a>');
        actions.append(button);

        itemDiv.append(actions);

        $('#bookList').append(itemDiv)
    })
}

function sanitizeBookList(data) {
    let list = [];
    for (let i = 0; i < 10; i++) {
        list.push({
            id: data.results[i].list_name_encoded,
            name: (typeof data.results[i].list_name === 'undefined') ? 'Unknown' : data.results[i].list_name
        })
    }
    return list;
}

function sanitizeBooks(response) {
    let data = [];
    response.results.books.forEach((d) => {
        data.push({
            id: d.primary_isbn10,
            title: (typeof d.title === 'undefined') ? 'Unknown' : d.title,
            author: (typeof d.author === 'undefined') ? 'Unknown' : d.author,
            description: (typeof d.description === 'undefined') ? 'Not found.' : d.description,
            rank: (typeof d.rank === 'undefined') ? 1 : d.rank,
            image: d.book_image,
            product_url: d.amazon_product_url,
        })
    })
    return data;
}

function sanitizeBook(response) {
    let data;
    response.items.forEach((d) => {
        data = {
            id: d.volumeInfo.industryIdentifiers[1].identifier,
            title: (typeof d.volumeInfo.title === 'undefined') ? 'Unknown' : d.volumeInfo.title,
            subtitle: (typeof d.volumeInfo.subtitle === 'undefined') ? 'Unknown' : d.volumeInfo.subtitle,
            authors: d.volumeInfo.authors.toString(),
            description: (typeof d.volumeInfo.description === 'undefined') ? 'Not found.' : d.volumeInfo.description,
            categories: d.volumeInfo.categories.toString(),
            publisherAt: d.volumeInfo.publishedDate,
            image: d.volumeInfo.imageLinks.thumbnail,
            product_url: d.volumeInfo.webReaderLink,
        };
    })
    return data;
}