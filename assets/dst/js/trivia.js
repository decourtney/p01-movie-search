$(function ()
{
    //Selectors
    let questionEl = $("#question");
    let answersEl = $("#answers");
    let triviaSectionEl = $("#trivia-section");
    let triviaButtonsEl = $("#trivia-buttons");
    let timerEl = $("#timer");

    // Global Variables
    let omdbKey = "3e723361";
    let homeURL = "../../../index.html"
    let index;
    let triviaObjs = []
    let triviaTimer;


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
                displayErrorModal(xhr.responseText);
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
            answersEl.append($("<ul>", { "class": "bg-white rounded-lg border border-gray-200 w-96 text-gray-900" }))

            for (let i = 0; i < triviaObjs[index].answers.length; i++)
            {
                if (triviaObjs[index].answers[i].split("", 1).toString() === "~")
                {
                    answersEl.children("ul").append($("<li>", { "class": "correct block px-6 py-2.5 bg-blue-600 text-white font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out" }).text(triviaObjs[index].answers[i].slice(1, triviaObjs[index].answers[i].length)));
                } else
                {
                    answersEl.children("ul").append($("<li>", { "class": "block px-6 py-2.5 bg-blue-600 text-white font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out" }).text(triviaObjs[index].answers[i]));
                }
            }
        } else
        {
            clearInterval(triviaTimer);
            timerEl.text("00");
        }

        index++;
    }

    function runTimer()
    {
        let timeLeft = 30;
        triviaTimer = setInterval(function ()
        {
            if (timeLeft > 0)
            {
                timerEl.text(timeLeft);
                timeLeft--;
            } else
            {
                clearInterval(triviaTimer);
                timerEl.text("00");
            }
        }, 1000);
    }

    function checkAnswer(event)
    {
        let answer = event.target;

        if (answer.matches(".correct") === true)
        {
            // Do something when correct answer is selected

        } else
        {
            // Do something when incorrect answer is selcted
        }

        displayCorrectAnswer();
    }

    function displayCorrectAnswer()
    {
        triviaButtonsEl.empty("button");
        answersEl.children("li").click(false);

        triviaButtonsEl.append($("<button>", { "id": "next-question", "class": "inline-block mx-2 px-6 py-2.5 bg-blue-600 text-white font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out" }).text("Next Question"));
    }


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
