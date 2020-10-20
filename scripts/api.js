const API_URL = 'https://api.nytimes.com/svc/books/v3/';

$(function() {
    loadListNames();

    $('#nameList').on('change', function() {
        loadBooks(this.value);
    });
});

function loadListNames() {
    $.ajax({
        url: API_URL + `lists/names.json?api-key=${config.API_KEY}`,
        type: 'GET',
        dataType: 'json',
        beforeSend: startLoading,
        complete: stopLoading,
        success: function(res) {
            displaySelect(sanitizeListNames(res));
        },
        error: function(request) {
            displayError(request.error);
        }
     })
}

function loadBooks(listName) {
    $.ajax({
        url: API_URL + `lists/current/${listName}.json?api-key=${config.API_KEY}`,
        type: 'GET',
        dataType: 'json',
        beforeSend: startLoading,
        complete: stopLoading,
        success: function(res) { 
            $('#list-name').text(res.results.list_name);
            $('#list-date').text(res.results.published_date);
            displayData(sanitizeData(res));
        },
        error: function(request) {
            displayError(request.error);
        }
     }).then(()=>{
        loadFavoriteBooks();
     })
}

function loadFavoriteBooks(){
    $(".favorite").each(function() {
        // Check if was favorited
        let bookId = $(this).data("bookid");
        if (localStorage.getItem(bookId)) {
            $(this).toggleClass("favorited");
        }

        // Add click event
        $(this).click(function(e){
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

function displaySelect(items) {
    (items).forEach((data) => {        
        var option = new Option(data.name, data.id);
        $('#nameList').append(option)
    });
}

function displayData(items) {
    $('#bookList').empty();

    (items).forEach((data) => {
        const itemDiv = $(`<div id="${data.id}" class="book-item card card-body"></div>`).attr('id', data.id);

        const img = $('<img class="img-fluid">').attr('src', data.image)
        itemDiv.append(img);

        const labelRank = $(`<div class="label-rank">${data.rank}</label>`);
        itemDiv.append(labelRank);

        const title = $('<h4 class="title"></h4>').text(data.title);
        itemDiv.append(title);

        const divAuthor = $('<div class="div-info"></div>');
        divAuthor.append($('<span class="small"></span>').text(`Author`));
        divAuthor.append($('<span></span>').text(data.author));
        itemDiv.append(divAuthor);
        
        const desc = $('<p class="desc"></p>').text(data.description);
        itemDiv.append(desc);
        
        const actions = $(`<div class="actions" ></div>`);
        const favorite = $(`<a href="" class="favorite" data-bookid="${data.id}" ></a>`);
        actions.append(favorite);
        const button = $('<a class="btn btn-warning d-block" href="'+ data.product_url +'" target="_blank">BUY BOOK &nbsp; <i class="fas fa-shopping-cart"></i></a>');
        actions.append(button);
        
        itemDiv.append(actions);

        $('#bookList').append(itemDiv)
    })
}

function sanitizeListNames(data) {
    let list = [];
    for (let i=0; i < 10; i++) {
        list.push({
            id: data.results[i].list_name_encoded,
            name: (typeof data.results[i].list_name === 'undefined') ? 'Unknown': data.results[i].list_name
        })
    }
    return list;
}

function sanitizeData(response) {
    let data = [];
    response.results.books.forEach((d) => {
        data.push({
            id: d.primary_isbn10,
            title: (typeof d.title === 'undefined') ? 'Unknown': d.title,
            author: (typeof d.author === 'undefined') ? 'Unknown': d.author,
            description: (typeof d.description === 'undefined') ? 'Not found.': d.description,
            rank: (typeof d.rank === 'undefined') ? 1: d.rank,
            image: d.book_image,
            product_url: d.amazon_product_url,
        })
    })
    return data;
}
