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
    let usernameInputEl = $("#username");
    let passwordInputEl = $("#password");

    // Global Variables
    let omdbKey = "3e723361";
    let nytimesKey = "Wv8CqWp1AwfoFBw2eqi5iK83OjGy3A7N";
    let triviaURL = "./trivia.html";


    function checkForSessionProfile()
    {
        // We need a profile to work with so upon load/refresh check for an active profile
        if (!getSessionStorage("currentProfile"))
        {
            // If no active profile then create or get the default profile
            (!getLocalStorage("Player 1")) ? createUserProfile("Player 1", "") : logInProfile("Player 1", "")
        }
    }

    function displayLoginModal()
    {
        // When the login button is clicked - Display modal with username/password fields; Login button; Create Account button; Cancel button
        // User completes both fields and clicks one of the buttons
    }

    function createUserProfile(uname, pword)
    {
        // When Create Account button is clicked: 
        // Check local storage and if the account already exits then display message indicating
        // Else create a user object and send to storage with the account name as the store name
        // Assuming creation of new user then log the user in after account creation
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
            console.log("Username already in use");
            return;
        }

        logInProfile(profile.name, profile.password);
    }

    function logInProfile(uname, pword)
    {
        // Called when Login Button is clicked or createUserProfile function calls
        // Username/password is used to get that users local stored object - store name should match the username
        // The user object will need to be loaded into sessionStorage to persist throughout the pages
        let storedProfile = getLocalStorage(uname)[0];

        if (!storedProfile || storedProfile.password !== pword)
        {
            // Reload login modal with error message
            console.log(`Wrong username/password`)
            return;
        }

        // Use session profile to reference localStorage
        setSessionStorage(storedProfile.name, "currentProfile");
    }

    function displayProfileMovieCarousel()
    {
        // Load movies from list stored with the users profile
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
                $("<br>"),
                $("<button>", { "id": "movie-button" }).text(listOfMovies[i].Year + " - " + listOfMovies[i].Title)
            )
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
            createUserProfile(uname, pword);
        }
    })

    // Homepage on(click/submit) events
    // on click for movie carousel/watchlist cards to load movie info into results page
    // on click for Starting the Trivia Game

    // Global on(click/submit) events
    // on click for Login
    // on click for Home


    modalButtonEl.on("click", function () { movieNotFoundModalEl.css("display", "block"); });
    movieNotFoundModalEl.on("click", ".close", function () { movieNotFoundModalEl.css("display", "none"); });
    $(window).on("click", function (event) { if (event.target == movieNotFoundModalEl) { movieNotFoundModalEl.css("display", "none"); }; });
    $("#load-trivia").on("click", function () { window.location = triviaURL });
    $("#load-results").on("click", loadResults);

    checkForSessionProfile();

    let temp = document.getElementById("heading");

    temp.appendChild(document.createElement("p"))
});

