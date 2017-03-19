/* global $*/
$(function () {
    "use strict";

    var root = 'https://jsonplaceholder.typicode.com',
        users = $("#users"),
        button = $("#button"),
        prevNext = $("#prevNext"),
        extraStuff = $("#extraStuff"),
        pageNumbers = $("#pageNumbers"),
        myUsersArray = [],
        myPostPagesArray = [],
        currantPage = 0,
        amountPerPage = 3,
        amountPerPageInput;

    $.ajax({
        url: root + '/users',
        method: 'GET'
    }).then(function (data) {
        myUsersArray = data;
        createUsersList();
    });

    function createPageAmountButton() {
        extraStuff.append('Show<input type="number" id="amountPerPageInput">posts at a time.');
        amountPerPageInput = $("#amountPerPageInput");
    }

    function createUsersList() {

        createPageAmountButton();

        myUsersArray.forEach(function (user) {
            users.append('<li class="myLi" id="' + user.id + '"><strong>Name</strong>: ' + user.name + '<br><strong>Website</strong>: ' + user.website + '<br><strong>Company Name</strong>: ' + user.company.name + '</li>');
        });

        var myLi = $(".myLi");
        hover(myLi);
        //myLi.css("border-bottom", "3px solid black");

        myLi.click(function (event) {
            var target = $(event.target),
                id = target.attr("id");
            $.ajax({
                url: root + '/posts?userId=' + id,
                method: 'GET'
            }).then(function (data) {
                extraStuff.empty();
                createPages(data);
                createUserPosts();
                createPageJumper(myPostPagesArray);
                createBackButton();
            });
        });
    }

    function createPages(data) {

        if (amountPerPageInput.val() < data.length) {
            createPrevNext();
            if (amountPerPageInput.val() > 0) {
                amountPerPage = amountPerPageInput.val();
            }
        } else {
            amountPerPage = data.length;
        }

        var i = 0,
            j = 0,
            t = 1,
            tempArray = [];
        for (i; i < data.length; i++) {
            tempArray.push(data[i]);
            if (i == data.length - 1) {
                myPostPagesArray[j] = [];
                myPostPagesArray[j].push(tempArray);
                break;
            }
            if (t % amountPerPage === 0) {
                myPostPagesArray[j] = [];
                myPostPagesArray[j].push(tempArray);
                j++;
                tempArray = [];
            }
            t++;
        }
    }

    function createUserPosts() {
        users.empty();

        myPostPagesArray[currantPage][0].forEach(function (post) {
            users.append('<li id="li' + post.id + '"><strong>Title</strong>: ' +
                post.title + '<br><strong>Post</strong>: ' +
                post.body + '</li><br><strong>Add comment</strong>: <strong>Name</strong>: <input class="input" id="name' + post.id + '"> <strong>Comment</strong>: <input class="input" id="comment' + post.id + '"><button class="post" id="post' + post.id + '">Post</button>' +
                '<br><button class="showComments" id="' + post.id + '">Show Comments</button>');
        });
        var showComments = $(".showComments"),
            input = $(".input").css({ "border-radius": "3px" }),
            post = $(".post");
        hover(showComments);
        hover(post);


        post.click(function (event) {
            var target = $(event.target),
                id = target.attr("id");
            $.ajax({
                url: root + '/comments?postId=' + id,
                method: 'POST',
                data: {
                    name: $("name" + id).val(),
                    comment: $("comment" + id).val()
                }
            }).then(function (data) {
                console.log(data);
            });
        });


        showComments.click(function (event) {
            var target = $(event.target),
                id = target.attr("id"),
                insertInto = $("#li" + id),
                changeText = $("#" + id);

            $("#comments" + id).remove();
            insertInto.append('<ul id="comments' + id + '"></ul>');
            var comments = $("#comments" + id).css({
                "background-color": "lightgrey",
                "border-radius": "8px",
                "border": "2px solid blue",
                "padding": "5px",
                "list-style-type": "none",
                "margin": "0"
            });

            if (changeText.text() == "Show Comments") {
                $.ajax({
                    url: root + '/comments?postId=' + id,
                    method: 'GET'
                }).then(function (data) {
                    data.forEach(function (comment) {
                        comments.append('<li><strong>Name</strong>: ' + comment.name + '<br><strong>Comment</strong>: ' + comment.body + '</li>');
                    });
                    changeText.text("Hide Comments");
                });
            } else {
                comments.remove();
                changeText.text("Show Comments");
            }
        });
    }

    function hover(element) {
        element.hover(function () {
            $(this).css("color", "blue");
        }, function () {
            $(this).css("color", "black");
        });
        element.css({ "border-radius": "4px", "border": "2px solid black", "margin": "5px", "padding": "5px", "background-color": "lightgrey" });
    }

    function changePageNumber() {
        var selecter = $("#selecter").val(currantPage + 1);
    }

    function createPageJumper(array) {
        pageNumbers.empty();
        pageNumbers.append('Showing page <select id="selecter"></select > of ' + array.length);
        var selecter = $("#selecter");
        var i = 1;
        for (i; i < array.length + 1; i++) {
            selecter.append('<option value="' + i + '">' + i + '</option>');
        }

        selecter.change(function () {
            currantPage = selecter.val() - 1;
            changePageNumber();
            createUserPosts();
        });
    }

    function createPrevNext() {
        prevNext.append('<button id="prev"><strong>Prev</strong></button><button id="next"><strong>Next</strong></button>');
        var prev = $("#prev").css({ "width": "70px" }),
            next = $("#next").css({ "width": "70px" });
        hover(prev);
        hover(next);

        prev.click(function (event) {
            if (currantPage > 0) {
                currantPage--;
                changePageNumber();
                createUserPosts();
            }
        });

        next.click(function (event) {
            if (currantPage < myPostPagesArray.length - 1) {
                currantPage++;
                changePageNumber();
                createUserPosts();
            }
        });
    }

    function createBackButton() {
        button.append('<button id="back"><strong>Back</strong></button>');
        var back = $("#back").css({ "width": "70px" });
        hover(back);

        back.click(function (event) {
            button.empty();
            prevNext.empty();
            users.empty();
            pageNumbers.empty();
            createUsersList();
            currantPage = 0;
            amountPerPage = 3;
            myPostPagesArray = [];
        });
    }

} ());