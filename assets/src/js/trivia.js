$(function ()
{
    // Carry over functions to handle Nav bar functions
    // Carry over functions to handle set/get to local and session storage 

    // `http://www.omdbapi.com/?${searchArg}&type=movie&r=json&apikey=${omdbKey}`

    //Selectors
    let questionEl = $("#question");
    let answersEl = $("#answers");
    let triviaSectionEl = $("#trivia-section");
    let triviaButtonsEl = $("#trivia-buttons")

    // Global Variables
    let omdbKey = "3e723361";
    let nytimesKey = "Wv8CqWp1AwfoFBw2eqi5iK83OjGy3A7N";
    let homeURL = "../../../index.html"
    let index;
    let triviaObjs = []


    function requestTriviaQA()
    {
        $.ajax({
            url: requestUrl = "https://opentdb.com/api.php?amount=10&category=11",
            type: "GET",
            timeout: 5000,
            success: function (data)
            {
                if (data.response_code === 0)
                {
                    // Callback function
                    createTriviaObj(data);
                }
            },
            error: function (xhr, status, error)
            {
                // Needs error handling work
                // displayErrorModal(xhr.status);
            }
        });
    }

    function createTriviaObj(data)
    {
        data.results.forEach(result =>
        {

            let triviaQA = {
                question: result.question.replaceAll("&quot;", "\"").replaceAll("&#039;", "\'").replaceAll("&hellip;", "...").replaceAll("&ldquo;", "`"),
                answers: ["~" + result.correct_answer.replaceAll("&quot;", "\"").replaceAll("&#039;", "\'").replaceAll("&hellip;", "...").replaceAll("&ldquo;", "`")],
            }

            result.incorrect_answers.forEach(ans =>
            {
                triviaQA.answers.push(ans.replaceAll("&quot;", "\"").replaceAll("&#039;", "\'").replaceAll("&hellip;", "...").replaceAll("&ldquo;", "`"));
            });

            triviaQA.answers = triviaQA.answers.sort((a, b) => 0.5 - Math.random())
            triviaObjs.push(triviaQA);
        });

        startTrivia();
    }

    function startTrivia()
    {
        // Display timer, question with clickable answers
        index = 0;
        runTimer();
        displayNextQA();

    }

    function displayNextQA()
    {
        // Clear elements
        questionEl.empty("p");
        answersEl.empty("ul");
        triviaButtonsEl.empty("button");

        if (index < triviaObjs.length)
        {
            questionEl.append($("<h2>", { "id": "question", "class": "my-2 px-2 py-4 bg-background" }).text(triviaObjs[index].question));

            for (let i = 0; i < triviaObjs[index].answers.length; i++)
            {
                if (triviaObjs[index].answers[i].split("", 1).toString() === "~")
                {
                    answersEl.append($("<li>", { "class": "correct block px-6 py-2.5 bg-blue-600 text-white font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out" }).text(triviaObjs[index].answers[i].slice(1, triviaObjs[index].answers[i].length)));
                } else
                {
                    answersEl.append($("<li>", { "class": "block px-6 py-2.5 bg-blue-600 text-white font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out" }).text(triviaObjs[index].answers[i]));
                }
            }

        } else
        {
            // Reached the end of the QAs - Stop timer and end game
        }

        index++;
    }

    function runTimer()
    {
        // If timer runs out - displayCorrectAnswer()
        console.log("Timer has started");
    }

    function checkAnswer(event)
    {
        let answer = event.target;
        
        if (answer.matches(".correct") === true)
        {
            // Do something when correct answer is selected
            console.log("Correct answer selected");
            
        } else
        {
            // Do something when incorrect answer is selcted
            console.log("Incorrect answer selected");
        }

        displayCorrectAnswer();
    }

    function displayHint()
    {
        // Maybe?
    }

    function displayCorrectAnswer()
    {
        triviaButtonsEl.empty("button");
        answersEl.children("li").click(false);

        triviaButtonsEl.append($("<button>", { "id": "next-question", "class": "inline-block mx-2 px-6 py-2.5 bg-blue-600 text-white font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out" }).text("Next Question"));
    }

    // function requestAPI(url, infoCallback)
    // {
    //     $.ajax({
    //         url: url,
    //         type: "GET",
    //         timeout: 5000,
    //         success: function (data)
    //         {
    //             // OMDB returns True if a movie is found. NYTimes returns OK if found
    //             if (data.Response == "True" || data.status == "OK")
    //             {
    //                 // Callback function
    //                 infoCallback(data);
    //             }
    //         },
    //         error: function (xhr, status, error)
    //         {
    //             // Needs error handling work
    //             // displayErrorModal(xhr.status);
    //         }
    //     });
    // }

    // function createMovieObj(value)
    // {
    //     let movieObj = {
    //         name: value.Title,
    //         genre: value.Genre,
    //         rated: value.Rated,
    //         actors: value.Actors,
    //         year: value.Year,
    //         ratings: value.Ratings,
    //         plot: value.Plot,
    //         poster: value.Poster,
    //         metascore: value.Metascore,
    //         imdbRating: value.imdbRating,
    //         review: ""
    //     };

    //     addToFavorites(movieObj);
    // }

    // function addToFavorites(obj)
    // {
    //     // Add the selected movie object to the profile favorites
    //     let profile = getSessionStorage()[0];

    //     // Make sure the movie title doesn
    //     if (profile.favorites.length > 0)
    //     {
    //         for (let i = 0; i < profile.favorites.length; i++)
    //         {
    //             if (obj.name === profile.favorites[i].name)
    //             {
    //                 profile.favorites.splice(i, 1);
    //             }
    //         }

    //         profile.favorites.push(obj);

    //         // Now that the movie is added we have to reach out to nytimes for the review link
    //         requestAPI(`https://api.nytimes.com/svc/movies/v2/reviews/search.json?query=${obj.name.split(" ").join("+")}&api-key=${nytimesKey}`, addReviewToMovieObj);
    //     } else
    //     {
    //         profile.favorites = [obj];
    //     }

    //     setLocalStorage(profile, profile.name);
    // }

    // function addReviewToMovieObj(value)
    // {
    //     if (value.results == null)
    //     {
    //         return;
    //     }
    //     let profile = getSessionStorage()[0];
    //     console.log(profile.favorites)
    //     // Because the movieobj is already stored we have to iterate through the stored movies
    //     // And match the nytimes obj title with the stored movie title and add the review to that movieobj
    //     profile.favorites.forEach(element =>
    //     {
    //         if (value.results[0].display_title === element.name)
    //         {
    //             element.review = value.results[0].link;
    //             setLocalStorage(profile, profile.name);
    //         }
    //     })
    // }

    // function getSessionStorage()
    // {
    //     // After login - should use the current profile reference to get from localStorage
    //     return getLocalStorage(JSON.parse(sessionStorage.getItem("currentProfile")));
    // }

    // function setSessionStorage(obj, storename)
    // {
    //     // Once data is set or updated to sessionStorage then also update/set localStorage
    //     sessionStorage.clear();
    //     sessionStorage.setItem(storename, JSON.stringify(obj));
    // }

    // function getLocalStorage(storeName)
    // {
    //     let storage = JSON.parse(localStorage.getItem(storeName));
    //     return storage;
    // }

    // function setLocalStorage(obj, storeName)
    // {
    //     let storage = JSON.parse(localStorage.getItem(storeName));

    //     // Check if storage is null. If so then this is the first element to be added so skip to else
    //     if (storage)
    //     {
    //         // Iterate through the stored objects looking for duplicate entries. If a dupe is found
    //         // then its removed and the new instance is added.
    //         for (let i = 0; i < storage.length; i++)
    //         {
    //             if (obj.name === storage[i].name)
    //             {
    //                 storage.splice(i, 1);
    //             }
    //         }

    //         storage.push(obj);
    //     } else
    //     {
    //         storage = [obj];
    //     }

    //     localStorage.setItem(storeName, JSON.stringify(storage));
    // }


    $("#home-button").on("click", function () { window.location = homeURL; })
    $("#start-trivia").on("click", startTrivia);
    answersEl.on("click", "li", checkAnswer);
    triviaSectionEl.on("click", "#add-favorites", function ()
    {
        let title = answersEl.children("li.correct").text();
        requestAPI(`http://www.omdbapi.com/?t=${title}&type=movie&r=json&apikey=${omdbKey}`, createMovieObj);
    })
    triviaSectionEl.on("click", "#next-question", displayNextQA);

    requestTriviaQA();

});
