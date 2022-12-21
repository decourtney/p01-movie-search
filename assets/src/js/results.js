// Shouldn't be too many moving objects on this page
// requestAPI, createMovieObj, addReviewToMovieObj functions' save mechanics will change slightly
// get/set session and local storage will only be necessary when the user adds the movie to their list
$(function ()
{
    let movieSearchEl = $("#movie-search");
    let movieCardEl = $("#movie-poster");
    let movieInfoEl = $("#movie-info");
    let movieCardsEl = $("#movie-cards");


    function getMovieTitle()
    {
        // Call getSessionStorage to grab the title
        // Query API for movie data
    }

    function displayMovieInfo()
    {
        // Displays all movie info
        // Display Add to list button; More Trivia button
        let favorites = getSessionStorage()[0].favorites;

        favorites.forEach((element, index) =>
        {
            let active;
            if (index == 0)
            {
                active = "active";
            }
            $(".carousel-inner").append(
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
                            $("<div>", { "id": `#review-link-${index}`, "class": "flex flex-col" })
                        )
                    )
                )
            )

            element.ratings.forEach(rating =>
            {
                $(`#ratings-card-${index}`).append(
                    $("<div>", { "class": "flex flex-col justify-between" }).append(
                        $("<h3>", { "class": "text-gray-500 text-ls leading-tight font-medium mb-2" }).text(rating.Source),
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

            if (element.review != "")
            {
                $(`#review-link-${index}`).append(
                    $("<a>", { "class": "text-blue-600 hover:text-blue-700 transition duration-300 ease-in-out", "href": `${element.review.url}`, "target": "_blank" }).text("New York Times Review")
                );
            }
        });

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

    displayMovieInfo();
});