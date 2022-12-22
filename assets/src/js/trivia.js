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
    let triviaQAs = ["Best Gun-Fu Movie;~John Wick;John Wick: Chapter 2;John Wick: Chapter 3", "End of Line"];
    let index;


    function getTriviaQA()
    {
        // Still need to figure out how to generate QAs - either a prefab list or finding another API
    }

    function displayStartButton()
    {
        // Page should load with simple list of rules and Start button
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

        if (index < triviaQAs.length)
        {
            let nextQA = triviaQAs[index].split(";", triviaQAs[index].length);
            $("<p>").appendTo(questionEl).text(nextQA[0]);

            for (let i = 1; i < nextQA.length; i++)
            {

                if (nextQA[i].split("", 1).toString() === "~")
                {
                    $("<li>", { "class": "correct" }).text(nextQA[i].slice(1, nextQA[i].length)).appendTo(answersEl);
                } else
                {
                    $("<li>").text(nextQA[i]).appendTo(answersEl);
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
        // Do something when wrong/right answer; Limit number of guesses
        // Display hint if wrong answer
        // Once guess limit is hit or correct answer selected then displayCorrectAnswer()
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
        // Called from checkAnswer() when correct answer is selected or from runTimer() when time runs out
        // Highlight correct answer; Maybe display hint (remove clickability from answers)
        // Display Next and More Info buttons
        $("<button>", { "id": "add-favorites" }).text("Save Movie").appendTo(triviaButtonsEl);
        $("<button>", { "id": "next-question" }).text("Next Question").appendTo(triviaButtonsEl);
    }

    function loadResults()
    {
        // Store movie title in sessionStorage
        // Load Results page
    }

    function requestAPI(url, infoCallback)
    {
        $.ajax({
            url: url,
            type: "GET",
            timeout: 5000,
            success: function (data)
            {
                // OMDB returns True if a movie is found. NYTimes returns OK if found
                if (data.Response == "True" || data.status == "OK")
                {
                    // Callback function
                    infoCallback(data);
                }
            },
            error: function (xhr, status, error)
            {
                // Needs error handling work
                // displayErrorModal(xhr.status);
            }
        });
    }

    function createMovieObj(value)
    {
        let movieObj = {
            name: value.Title,
            genre: value.Genre,
            rated: value.Rated,
            actors: value.Actors,
            year: value.Year,
            ratings: value.Ratings,
            plot: value.Plot,
            poster: value.Poster,
            metascore: value.Metascore,
            imdbRating: value.imdbRating,
            review: ""
        };

        addToFavorites(movieObj);
    }

    function addToFavorites(obj)
    {
        // Add the selected movie object to the profile favorites
        let profile = getSessionStorage("currentProfile")[0];

        // Make sure the movie title doesn
        if (profile.favorites.length > 0)
        {
            for (let i = 0; i < profile.favorites.length; i++)
            {
                if (obj.name === profile.favorites[i].name)
                {
                    profile.favorites.splice(i, 1);
                }
            }

            profile.favorites.push(obj);

            // Now that the movie is added we have to reach out to nytimes for the review link
            requestAPI(`https://api.nytimes.com/svc/movies/v2/reviews/search.json?query=${obj.name.split(" ").join("+")}&api-key=${nytimesKey}`, addReviewToMovieObj);
        } else
        {
            profile.favorites = [obj];
        }

        setLocalStorage(profile, profile.name);
    }

    function addReviewToMovieObj(value)
    {
        if (value.results == null)
        {
            return;
        }
        let profile = getSessionStorage("currentProfile")[0];
        console.log(profile.favorites)
        // Because the movieobj is already stored we have to iterate through the stored movies
        // And match the nytimes obj title with the stored movie title and add the review to that movieobj
        profile.favorites.forEach(element =>
        {
            if (value.results[0].display_title === element.name)
            {
                element.review = value.results[0].link;
                setLocalStorage(profile, profile.name);
            }
        })
    }

    function getSessionStorage(storeName)
    {
        // After login - should use the current profile reference to get from localStorage
        return getLocalStorage(JSON.parse(sessionStorage.getItem(storeName)));
    }

    function setSessionStorage(obj, storename)
    {
        // Once data is set or updated to sessionStorage then also update/set localStorage
        sessionStorage.clear();
        sessionStorage.setItem(storename, JSON.stringify(obj));
    }

    function getLocalStorage(storeName)
    {
        let storage = JSON.parse(localStorage.getItem(storeName));
        return storage;
    }

    function setLocalStorage(obj, storeName)
    {
        let storage = JSON.parse(localStorage.getItem(storeName));

        // Check if storage is null. If so then this is the first element to be added so skip to else
        if (storage)
        {
            // Iterate through the stored objects looking for duplicate entries. If a dupe is found
            // then its removed and the new instance is added.
            for (let i = 0; i < storage.length; i++)
            {
                if (obj.name === storage[i].name)
                {
                    storage.splice(i, 1);
                }
            }

            storage.push(obj);
        } else
        {
            storage = [obj];
        }

        localStorage.setItem(storeName, JSON.stringify(storage));
    }

    // Trivia on(click/submit) events
    // on click for Start button
    // on click for Answer buttons
    // on click for Next button
    // on click for MoreInfo button

    // Global on(click/submit) events
    // on click for Login
    // on click for Home
    $("#home-button").on("click", function () { window.location = homeURL; })
    $("#start-trivia").on("click", startTrivia);
    answersEl.on("click", "li", checkAnswer);
    triviaSectionEl.on("click", "#add-favorites", function ()
    {
        let title = answersEl.children("li.correct").text();
        requestAPI(`http://www.omdbapi.com/?t=${title}&type=movie&r=json&apikey=${omdbKey}`, createMovieObj);
    })
    triviaSectionEl.on("click", "#next-question", displayNextQA);
});