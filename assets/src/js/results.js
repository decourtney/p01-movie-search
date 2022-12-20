// Shouldn't be too many moving objects on this page
// requestAPI, createMovieObj, addReviewToMovieObj functions' save mechanics will change slightly
// get/set session and local storage will only be necessary when the user adds the movie to their list

function getMovieTitle()
{
    // Call getSessionStorage to grab the title
    // Query API for movie data
}

function displayMovieInfo()
{
    // Displays all movie info
    // Display Add to list button; More Trivia button
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

// Results on(click/submit) events
// on click for +List button
// on click for Moar Trivia button

// Global on(click/submit) events
// on click for Login
// on click for Home
