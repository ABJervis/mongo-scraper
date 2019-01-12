//get articles as JSON
$.getJSON("/articles", function(data){
  //do this for each article
  for (var i = 0; i < data.length; i++){
      //this will display the articles on the page
      $("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "</p>");
  }
});

//listen for someone to click a p tag 
$(document).on("click", "p", function(){
  //start clean, empty the notes
  $("#comments").empty();
  //save the id from the p tag, this allows you to pull the information you need from the article
  var thisId = $(this).attr("data-id");

  //now call for the article - you have to get it
  $.ajax({
      method: "GET",
      url: "/articles/" + thisId
  })

  //THEN you have to get the information to the page, use append to do this
  .then(function(data){
    console.log(data);
    //we need the headline(title), body, URL, first the title
    $("#comments").append("<h1>" + data.title + "</h1>");
    //now the body
    $("#comments").append("<input id = 'titleinput' name='title' >");
    //need a text area to add a comment
    $("#comments").append("<textarea id='bodyinput' name='body'></textarea>");
    //and, a button to submit the comment along with the id of the article to tie them together
    $("#comments").append("button data-id' " + data._id + "' id='savecomment'>Save Comment</button");

    //if there is a comment to the article, place the title and the comment as needed
    if(data.comment) {
        $("titleinput").val(data.comment.title);
        $("#bodyinput").val(data.comment.body);
    }
  });
});

//set an action for when the savecomment button is clicked
$(document).on("click", "#savecomment", function(){
  //get the id associated with the article, this is necessary to tie the comment to the article
  var thisId = $(this).attr("data-id");

  //to change the comment, we need to POST
  $.ajax({
      method: "POST",
      url: "/articles/" + thisId,
      data: {
        //title 
        title: $("titleinput").val(),
        //comment
        body: $("bodyinput").val()
    }
  })

  //now that that is done, we need to empty the comment field so it is ready to go for the next comment
  .then(function(data){
      console.log(data);
      $("#comments").empty();
  });

  //also need to remove the values entered in the input and text area for comment entry
  $("titleinput").val("");
  $("#bodyinput").val("");
});

