import express from "express";
const app = express()
const port = 80;
import {RestCollectorClient} from "rest-collector";

import pkg from 'node-html-parser';

app.get('/', (req, res) => {
    res.send(`location: ${process.env.LOCATION}`);
});

app.get('status', (req, res) => {
    res.send(`ok`);
});

app.get('/api/crosswords', async (req, res) => {

    const client = new RestCollectorClient("https://www.14across.co.il/answers.php");
    const data = await client.get();
    const root = pkg.parse(data.data);

    const options = root.querySelectorAll("#selectCrossword option");

    res.send(options.map((crossword) => { return { text: crossword.text, id: crossword.attrs["value"]}}));
});

app.get('/api/crosswords/:crosswordId', async (req, res) => {

    const client = new RestCollectorClient(`https://www.14across.co.il/answers.php?crossword=${req.params.crosswordId}`);
    const data = await client.get();
    const root = pkg.parse(data.data);

    const options = root.querySelectorAll("#prev_issues option");

    res.send(options.splice(1,options.length-1).map((crossword) => crossword.text));
});


app.get('/api/crosswords/:crosswordId/results', async (req, res) => {
    try {
        const url = req.query.url;
        const client = new RestCollectorClient(`https://www.14across.co.il/answers.php?wantsold=1&crossword=${req.params.crosswordId}&name=&date=${encodeURIComponent(req.query.date)}`);
        const data = await client.get();
        const root = pkg.parse(data.data);

        const questions = root.querySelectorAll("#answers-content .question_number");
        const array = questions.map((question) => {
            const anwer = question.nextElementSibling.nextElementSibling;
            let explanations = undefined;
            try {
                const explanationElements = question.parentNode.querySelectorAll(".help-texts ul li");
                if(explanationElements) {
                    explanations = explanationElements.map((explanationElement) => explanationElement.text)
                }

            } catch (error) {
                console.error(error);
            }
            return {
                question: question.textContent,
                answer: anwer.childNodes[0].getAttribute("data-content"),
                explanation: explanations
            }
        });

        let result = {};
        array.forEach(item => {
            result[item.question] = item;
        });

        res.send(result);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }

});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})