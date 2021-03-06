var puppyListModule = (function() {
  var puppyList,
    ajaxPuppies,
    breedList = [],
    ajaxBreeds,
    ajaxErrors;

  var registerEventListener = function () {
    $("#get-puppies").on("click", function(e) {
      e.preventDefault();
      getPuppyList();
    });

    $("form[data-ajaxremote='true']").submit( function( e ) {
      e.preventDefault();
      var $el = $( event.target );
      var formData = {
        name: $el.serializeArray()[0].value,
        breed_id: $el.serializeArray()[1].value
      };
      createPuppy(formData);
    });

    $("#puppy-list").on("click", "a", function( e ) {
      var id = Number($(e.target).attr("id").slice(1));
      removePuppy(id);
    });

    $(document).on("ajaxStart", function() {
      console.log("start");
      var $el = $("#ajax-status");
      $el.attr("class", "hidden center");
      $el.attr("style","");
      $el.addClass("loading");
      $el.text("Waiting...");
      setTimeout(function() {
        $el.text("Sorry this is taking so long...");
      }, 1000);
    });

    $(document).on("ajaxSuccess", function() {
          console.log("success");
      var $el = $("#ajax-status");
      $el.attr("class", "hidden center");
      $el.attr("style","");
      $el.addClass("success");
      $el.text("Finished!");
      $el.fadeOut(2000);
    });

    $(document).on("ajaxError", function(e) {
          console.log("error");
      var $el = $("#ajax-status");
      $el.attr("class", "hidden center");
      $el.attr("style","");
      $el.text( ajaxErrors );
      $el.addClass("failure");
      $el.fadeOut(2000);
    });
  };

  var createPuppy = function(formData) {
    //console.log(formData);
    var puppy = $.ajax({
      url: "https://ajax-puppies.herokuapp.com/puppies.json",
      method: "POST",
      data: JSON.stringify( formData ),
      dataType: "json",
      contentType: "application/json",
      headers:  { 'Content-Type': 'application/json' },
      success: function(event) {
        addToPuppyList(event.id, formData.name, breedList[formData.breed_id], new Date());
      },
      error: function( request, status, error ) {
        console.log("didn't create puppy");
        ajaxErrors = request.responseText;
      },
      complete: function(event) {
        console.log("complete");
      }
    });
  };

  var removePuppy = function(id) {
    $.ajax({
      url: 'https://ajax-puppies.herokuapp.com/puppies/' + id + '.json',
      method: "DELETE",
      success: function() {
        $("#p" + id).parent().remove();
        console.log("adopted puppy");
      },
      error: function( request, status, error ) {
        console.log("didn't adopt puppy");
        ajaxErrors = request.responseText;
      },
      complete: function() {
        console.log("complete");
      }
    });
  };

  var getPuppyList = function() {
    ajaxPuppies = $.ajax( {
      url: "https://ajax-puppies.herokuapp.com/puppies.json",
      data: {},
      type: "GET",
      dataType: "json",
      success: function() {
        populatePuppyList();
      },
      error: function( request, status, error ) {
        console.log("error");
        ajaxErrors = request.responseText;
      },
      complete: function() { console.log("complete"); }
    });
  };

  var populatePuppyList = function() {
    var jsonArray = JSON.parse(ajaxPuppies.responseText);
    $("#puppy-list").empty();

    for (var i = 0; i < jsonArray.length; i++) {
      var name = jsonArray[i].name;
      var breed = jsonArray[i].breed.name;
      var id = jsonArray[i].id;
      var createdAt = jsonArray[i].created_at;
      addToPuppyList(id, name, breed, createdAt);
    }
  };

  var addToPuppyList = function(id, name, breed, createdAt) {
    var newLi,
    newA,
    $hook = $("#puppy-list");

    // Populate each puppy entry in list
    newLi = $("<li></li>");
    newLi.text( name + " (" +  breed + "), " + createdAt + " -- " );

    // Create adopt link
    newA = $("<a></a>");
    newA.attr("id", "p" + id );
    newA.text("adopt");
    newA.attr("href", "#");

    // Append to DOM
    newA.appendTo(newLi);
    newLi.prependTo($hook);
  };

  var getBreedList = function() {
    ajaxBreeds = $.ajax( {
      url: "https://ajax-puppies.herokuapp.com/breeds.json",
      data: {},
      type: "GET",
      success: function() {
        populateBreedList();
      },
      error: function( request, status, error ) {
        console.log("error");
        ajaxErrors = request.responseText;
      },
      complete: function() {
        console.log("complete");
      }
    });
  };

  var populateBreedList = function() {
    var jsonArray = JSON.parse(ajaxBreeds.responseText),
      newOption,
      $hook = $("#breed-select");
      $hook.empty();

    for (var i = 0; i < jsonArray.length; i++) {
      // Populate each puppy entry in list
      newOption = $("<option></option>");
      newOption.val( jsonArray[i].id );
      newOption.text( jsonArray[i].name );
      breedList[jsonArray[i].id] = jsonArray[i].name;
      // Append to DOM
      newOption.appendTo($hook);
    }
  };

  return {
    registerEventListener: registerEventListener,
    getPuppyList: getPuppyList,
    getBreedList: getBreedList,
  };

})();

$(document).ready(function() {
  puppyListModule.registerEventListener();
  puppyListModule.getBreedList();
  puppyListModule.getPuppyList();
});
