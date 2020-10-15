const API_URL = 'https://api.nytimes.com/svc/books/v3/';

$(function() {
    // Load books when the form is submited
    $('#searchForm').submit(e => {
        e.preventDefault();
        let keyword = $(this).find(".keyword").val();
        let date = 'current';
        let list = 'hardcover-fiction';

        $.ajax({
            url: API_URL + `lists/${date}/${list}.json?api-key=${config.API_KEY}`,
            type: 'GET',
            dataType: 'json',
            success: function(res) { 
                let bookData = sanitizeData(res);
                displayData(bookData);
            },
            error: function(request) {
                displayError(request.error);
                //console.log(`${request.status} : ${request.error}`);
            }
         })
    });
})

function displayError(status) {
    $('.list').empty();
    const p = $('<p class="error"><p>').text();
}

function displayData(items) {
    $('.list').empty();

    (items).forEach((data) => {
        const itemDiv = $('<div class="book-item card card-body"></div>').attr('id', data.id);

        const img = $('<img class="img-fluid">').attr('src', data.image)
        itemDiv.append(img);

        const title = $('<h4 class="title"></h4>').text(data.title);
        itemDiv.append(title);

        const divAuthor = $('<div class="div-info"></div>');
        divAuthor.append($('<span class="small"></span>').text(`Author`));
        divAuthor.append($('<span></span>').text(data.author));
        itemDiv.append(divAuthor);

        const divRank = $('<div class="div-info"></div>');
        divRank.append($('<span class="small"></span>').text(`Rank`));
        divRank.append($(`<span class="rank"></span>`).text(data.rank));
        itemDiv.append(divRank);

        const innerDiv = $('<div class="inner-item"></div>')
        
        const desc = $('<p class="desc"></p>').text(data.description);
        innerDiv.append(desc);
        const button = $('<a class="btn btn-warning d-block" href="'+ data.product_url +'" target="_blank"></a>').text("BUY BOOK");
        innerDiv.append(button);

        itemDiv.append(innerDiv);
        $('.list').append(itemDiv)
    })
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