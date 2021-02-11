// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]

let categories = [];

const startButton = $("<button type='button' id='restartButton' class='btn btn-primary'>Restart Game</button>");

//html for the loading spinner
const spinner = $('<div class="spinner-border" id="spinner" role="status"><span class="sr-only">Loading...</span></div>')

/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */

async function getCategoryIds() {
    let idSet = new Set();
    while (idSet.size < 6) {
        //The random clue url for jService reduces the amount of code here
        //because there is no need to otherwise randomly select catagories.
        const random = await axios.get("http://jservice.io/api/random");
        idSet.add(random.data[0].category_id);
    }
    return Array.from(idSet);
}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

async function getCategory(catId) {
    return await axios.get(`http://jservice.io/api/category/?id=${catId}`);
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

async function fillTable() {
    // This string template literal was much more useful originally when
    // I wanted to use jQuery's .Data() property to store the questions and answers.
    // However, I could not figure out how to properly escape the questions/answers
    // and got a bug where sometimes the html showed initially instead of the question mark.
    // Eventually, I fixed this but kept the string template literal.
    let $table = $(`
        <table id="jeopardy" class="table table-bordered">
            <thead>
                <tr>
                    <th> ${categories[0].title} </th>
                    <th> ${categories[1].title} </th>
                    <th> ${categories[2].title} </th>
                    <th> ${categories[3].title} </th>
                    <th> ${categories[4].title} </th>
                    <th> ${categories[5].title} </th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td id="0-0" class="square">?</td>
                    <td id="1-0" class="square">?</td>
                    <td id="2-0" class="square">?</td>
                    <td id="3-0" class="square">?</td>
                    <td id="4-0" class="square">?</td>
                    <td id="5-0" class="square">?</td>
                </tr>
                <tr>
                    <td id="0-1" class="square">?</td>
                    <td id="1-1" class="square">?</td>
                    <td id="2-1" class="square">?</td>
                    <td id="3-1" class="square">?</td>
                    <td id="4-1" class="square">?</td>
                    <td id="5-1" class="square">?</td>
                </tr>
                <tr>
                    <td id="0-2" class="square">?</td>
                    <td id="1-2" class="square">?</td>
                    <td id="2-2" class="square">?</td>
                    <td id="3-2" class="square">?</td>
                    <td id="4-2" class="square">?</td>
                    <td id="5-2" class="square">?</td>
                </tr>
                <tr>
                    <td id="0-3" class="square">?</td>
                    <td id="1-3" class="square">?</td>
                    <td id="2-3" class="square">?</td>
                    <td id="3-3" class="square">?</td>
                    <td id="4-3" class="square">?</td>
                    <td id="5-3" class="square">?</td>
                </tr>
                <tr>
                    <td id="0-4" class="square">?</td>
                    <td id="1-4" class="square">?</td>
                    <td id="2-4" class="square">?</td>
                    <td id="3-4" class="square">?</td>
                    <td id="4-4" class="square">?</td>
                    <td id="5-4" class="square">?</td>
                </tr>
            </tbody>
        </table>
    `);
    $("#above-scripts").append($table);
}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

function handleClick(evt) {
    const boxId = $(this).attr('id')
    //col is column of the table as well as the index of categories where
    //this specific category is stored
    const col = boxId.charAt(0);
    const row = boxId.charAt(2);
    //if only the question mark is being displayed
    if (categories[col].clues[row].showing === null) {
        $(this).text(categories[col].clues[row].question);
        categories[col].clues[row].showing = "notNull";
    // else statement for when the question is displayed (or answer in the case of double clicks)
    } else {
        $(this).text(categories[col].clues[row].answer);
    }
}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

function showLoadingView() {
    //I am not sure what 'update the button' meant and it did not seem
    //necessary for my code
    $("#above-scripts").empty();
    $("#above-scripts").append(spinner);
}

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {
    $("#spinner").remove();
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {
    showLoadingView();
    const categoryIds = await getCategoryIds();

    for (let i = 0; i < 6; i++) {
        //goes through each category
        const category = await getCategory(categoryIds[i]);
        categories[i] = {};
        categories[i].title = category.data.title;
        categories[i].clues = [];
        //in each category this goes through each clue
        for (let j = 0; j < 5; j++) {

            categories[i].clues[j] = {};
            categories[i].clues[j].question = category.data.clues[j].question;
            categories[i].clues[j].answer = category.data.clues[j].answer;
            categories[i].clues[j].showing = null;
        }
    }
    fillTable();

    hideLoadingView();

    $('.square').on("click", handleClick);

    //a new start button is made and appended
    const startButton = $("<button type='button' id='restartButton' class='btn btn-primary'>Restart Game</button>");
    $("#above-scripts").append(startButton);

    $("#restartButton").on("click", setupAndStart);
}

$("#above-scripts").append(startButton);
/** On click of start / restart button, set up game. */
$("#restartButton").on("click", setupAndStart);