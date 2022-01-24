const express = require('express');
const res = require('express/lib/response');
const app = express();

app.use(express.json());

let persons = [
    {
        id: 1,
        name: 'Arto Hellas',
        number: '040-123456',
    },
    {
        id: 2,
        name: 'Ada Lovelace',
        number: '39-44-5323523',
    },
    {
        id: 3,
        name: 'Dan Abramov',
        number: '12-43-234345',
    },
    {
        id: 4,
        name: 'Mary Poppendieck',
        number: '39-23-6423122',
    },
];

const generateRandom = (max, min) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
};

app.get('/', (request, response) => {
    response.send('<h1>Hello World! </h1>');
});

app.get('/info', (request, response) => {
    response.send(
        `<p>Phonebook has info for ${
            persons.length
        } people.<br/> </p> ${new Date().toString()}`
    );
});

app.get('/api/persons', (request, response) => {
    response.json(persons);
});

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id);
    person = persons.filter((el) => el.id === id);
    if (person) {
        response.json(person);
    } else {
        response.status(404).end();
    }
});
app.post('/api/persons', (request, response) => {
    const body = request.body;
    if (!body.name) {
        return response.status(400).json({
            error: 'name missing!',
        });
    }
    if (!body.number) {
        return response.status(400).json({
            error: 'number missing!',
        });
    }
    if (persons.find((el) => el.name === body.name)) {
        return response.status(400).json({
            error: 'name must be unique',
        });
    }
    const person = {
        id: generateRandom(1, 1000),
        name: body.name,
        number: body.number,
    };

    persons = persons.concat(person);

    response.json(person);
});
app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id);
    persons = persons.filter((person) => person.id !== id);
    response.status(204).end();
});

const PORT = 3001;
app.listen(PORT);
console.log(`Server running on port${PORT}`);
