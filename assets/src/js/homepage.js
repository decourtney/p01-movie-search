// Save features may change slightly. For now if the user searches for a movie it will be saved to their list
// Will need to present the option to save a movie to their list
$(function ()
{
    // Selectors
    let movieSearchEl = $("#title-search");
    let movieListEl = $("#movie-list");
    let movieNotFoundModalEl = $("#errorModal");
    let modalButtonEl = $("#myBtn");
    let loginButtonEl = $("#login-button");
    let dismissModalEl = $("#dismiss-loginModal");
    let registerButtonEl = $("#register-button");
    let loginErrorEl = $("#login-error");
    let usernameInputEl = $("#username");
    let passwordInputEl = $("#password");
    let carouselItemsEl = $("#carousel-items");

    // Global Variables
    let omdbKey = "3e723361";
    let nytimesKey = "Wv8CqWp1AwfoFBw2eqi5iK83OjGy3A7N";
    let triviaURL = "./assets/src/html/trivia.html";
    let resultsURL = "./assets/src/html/results.html"
    let defaultMovie = "The Horse In Motion"


    function checkForSessionProfile()
    {
        // We need a profile to work with so upon load/refresh check for an active profile
        if (!getSessionStorage())
        {
            // If no active profile then create or get the default profile
            (!getLocalStorage("Player 1")) ? createUserProfile("Player 1", "") : logInProfile("Player 1", "")
        }
    }

    function createUserProfile(uname, pword)
    {
        let profile = {
            name: "",
            password: "",
            favorites: []
        };

        profile.name = uname;
        profile.password = pword; // if time permits - hash password before storage

        if (!getLocalStorage(profile.name))
        {
            setLocalStorage(profile, profile.name);
        } else
        {
            // Reload creation modal and display error message
            loginErrorEl.show().delay(3000).fadeOut().text(`Username already in use`);
            return;
        }

        logInProfile(profile.name, profile.password);
    }

    function logInProfile(uname, pword)
    {
        let storedProfile = getLocalStorage(uname);
        console.log(storedProfile)
        if (!storedProfile || storedProfile[0].password !== pword)
        {
            // Reload login modal with error message
            loginErrorEl.show().delay(3000).fadeOut().text(`Wrong username/password`);
            return;
        }

        // Use session profile to reference localStorage
        setSessionStorage(storedProfile[0].name, "currentProfile");

        addDefaultMovie();
        dismissModalEl.trigger("click");
        displayFavorites();
    }

    function addDefaultMovie()
    {
        requestAPI(`http://www.omdbapi.com/?t=${defaultMovie}&type=movie&r=json&apikey=${omdbKey}`, createMovieObj);
    }

    function displayFavorites()
    {
        carouselItemsEl.empty();
        let favorites = getSessionStorage()[0].favorites;

        // Need to clear the whole thing before updating

        favorites.forEach((element, index) =>
        {
            let active;
            if (index == 0)
            {
                active = "active";
            } else
            {
                active = ""
            }

            carouselItemsEl.append(
                $("<div>", { "class": `carousel-item ${active} float-left w-full` }).append($("<h2>", { "class": "font-semibold text-3xl mb-5 text-center" }).text(element.name),
                    $("<hr>", { "class": "my-6 border-gray-300" }),
                    $("<div>", { "class": "flex flex-col md:flex-row justify-center" }).append(
                        $("<div>", { "class": "flex flex-col md:flex-row md:max-w-4xl rounded-l-lg bg-white shadow-lg" }).append(
                            $("<img>", { "class": "w-full h-auto md:h-auto md:w-96 object-cover rounded-t-lg md:rounded-none md:rounded-l-lg", "src": element.poster, "alt": `${element.name} Poster` })
                        ),
                        $("<div>", { "class": "block p-6 rounded-r-lg shadow-lg bg-white md:w-96" }).append(
                            $("<div>", { "class": "flex flex-row justify-between" }).append(
                                $("<h3>", { "class": "text-gray-700 text-lg leading-tight font-medium mb-2" }).text(`${element.year} \u2022 ${element.rated}`),
                                $("<div>", { "class": "flex flex-col" }).append(
                                    $("<h3>", { "class": "text-gray-700 text-lg leading-tight font-medium mb-2 text-center" }).text(`IMDB`),
                                    $("<h3>", { "class": "text-gray-700 text-lg leading-tight font-medium mb-2 text-center" }).text(`${element.imdbRating}`)
                                )
                            ),
                            $("<br>"),
                            $("<h3>", { "class": "text-gray-900 text-xl leading-tight font-medium mb-2" }).text(`${element.plot}`),
                            $("<br>"),
                            $("<div>", { "id": `ratings-card-${index}`, "class": "flex flex-col md:flex-row" }),
                            $("<div>", { "id": `genre-${index}`, "class": "flex flex-row relative mb-5" }),
                            $("<div>", { "id": `review-link-${index}`, "class": "flex flex-col" })
                        )
                    )
                )
            )

            if (element.review != "")
            {
                $(`#review-link-${index}`).append(
                    $("<button>", { "type": "button", "class": "inline-block px-6 py-2.5 bg-transparent text-blue-600 font-medium text-xs leading-tight uppercase rounded hover:bg-gray-100 focus:text-blue-700 focus:bg-gray-100 focus:outline-none focus:ring-0 active:bg-gray-200 active:text-blue-800 transition duration-300 ease-in-out" }).append(
                        $("<a>", { "class": "text-lg text-blue-600 hover:text-blue-700 transition duration-300 ease-in-out", "href": `${element.review.url}`, "target": "_blank" }).text("New York Times Review")
                    )
                );
            }

            element.ratings.forEach(rating =>
            {
                $(`#ratings-card-${index}`).append(
                    $("<div>", { "class": "flex flex-col justify-between" }).append(
                        $("<h3>", { "class": "max-w-sm text-gray-500 text-ls leading-tight font-medium mb-2" }).text(rating.Source),
                        $("<h3>", { "class": "text-gray-500 text-xl leading-tight font-medium mb-2" }).text(rating.Value),
                    )
                );
            });

            let genres = element.genre.split(",");
            genres.forEach(genre =>
            {
                $(`#genre-${index}`).append(
                    $("<span>", { "class": "mr-1 mt-4 px-4 py-2 rounded-full text-gray-500 bg-gray-200 font-semibold text-sm flex align-center w-max" }).text(`${genre}`)
                );
            });
        });
    }

    function displayListOfMovies(value)
    {
        // If a list is returned then display the list of returned movies as clickable elements.
        // When selected send another requestAPI() 
        // Else send the single returned object to requestAPI()
        let listOfMovies = value.Search

        // Display list of movies for the user to select from
        for (let i = 0; i < listOfMovies.length; i++)
        {
            movieListEl.append(
                $("<li>", { "class": "px-6 py-2 border-b border-gray-200 w-full rounded-t-lg" }).append(
                    $("<button>", { "id": "movie-button" }).text(listOfMovies[i].Year + " - " + listOfMovies[i].Title)
                )
            )
            // movieListEl.append(
            //     $("<br>"),
            //     $("<button>", { "id": "movie-button" }).text(listOfMovies[i].Year + " - " + listOfMovies[i].Title)
            // )
        }
    }

    // Displays API movie-not-found errors (nytimes needs further testing)
    function displayErrorModal(msg)
    {
        movieNotFoundModalEl.children(".modal-content").empty();
        movieNotFoundModalEl.children(".modal-content").append(
            $("<span>", { "class": "close" }).html("&times;"),
            $("<p>").text(msg)
        );
        movieNotFoundModalEl.css("display", "block");
    }

    function loadTriviaGame()
    {
        // Load next page. Ensure page loads in the same tab - sessionStorage does not persist across different tabs or windows
    }

    function loadResults()
    {

    }

    // When a user searches for a movie use the '?s=' query parameter with callback to displayListOfMovies()
    // When searching for full data of a single movie use '?t=' parameter
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
                } else
                {
                    // For now if no movie is found a modal pops up with error text (if my temp html/css files are present)
                    displayErrorModal(data.Error);
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

        // setLocalStorage(movieObj, "movieObjects");
        addToFavorites(movieObj);
    }

    function addToFavorites(obj)
    {
        // Add the selected movie object to the profile favorites
        let profile = getSessionStorage()[0];

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

            profile.favorites.unshift(obj);

            // Now that the movie is added we have to reach out to nytimes for the review link
            requestAPI(`https://api.nytimes.com/svc/movies/v2/reviews/search.json?query=${obj.name.split(" ").join("+")}&api-key=${nytimesKey}`, addReviewToMovieObj);
        } else
        {
            profile.favorites = [obj];
        }

        setLocalStorage(profile, profile.name);
        displayFavorites();
    }

    function addReviewToMovieObj(value)
    {
        if (value.results == null)
        {
            return;
        }
        let profile = getSessionStorage()[0];

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

    function getSessionStorage()
    {
        // After login - should use the current profile reference to get from localStorage
        return getLocalStorage(JSON.parse(sessionStorage.getItem("currentProfile")));
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

    movieSearchEl.keypress(function (event)
    {
        let searchArg = "s=" + event.target.value;
        if (event.which == 13)
        {
            // Search Params: ?s= will return an array of up to 10 movies that has a matching pattern in the title.
            // Search Params: ?t= will return the first movie that matches the search pattern.
            requestAPI(`http://www.omdbapi.com/?${searchArg}&type=movie&r=json&apikey=${omdbKey}`, displayListOfMovies);
        }
    });

    movieListEl.on("click", "#movie-button", function (event)
    {
        let searchArg = "t=" + event.target.textContent.split("-")[1].trim();
        requestAPI(`http://www.omdbapi.com/?${searchArg}&type=movie&r=json&apikey=${omdbKey}`, createMovieObj);
    });

    loginButtonEl.on("click", function ()
    {
        let uname = usernameInputEl.val();
        let pword = passwordInputEl.val();

        if (uname && pword)
        {
            logInProfile(uname, pword);
        }
    })

    registerButtonEl.on("click", function ()
    {
        let uname = usernameInputEl.val();
        let pword = passwordInputEl.val();

        if (uname && pword)
        {
            createUserProfile(uname, pword);
        }
    })


    modalButtonEl.on("click", function () { movieNotFoundModalEl.css("display", "block"); });
    movieNotFoundModalEl.on("click", ".close", function () { movieNotFoundModalEl.css("display", "none"); });
    $(window).on("click", function (event) { if (event.target == movieNotFoundModalEl) { movieNotFoundModalEl.css("display", "none"); }; });
    $("#load-trivia").on("click", function () { window.location = triviaURL });
    $("#load-results").on("click", function () { window.location = resultsURL });

    checkForSessionProfile();
    displayFavorites();
});

