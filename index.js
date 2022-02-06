require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const app = express();

const cors = require('cors');
const Person = require('./models/person');

app.use(cors());
app.use(express.json());
app.use(express.static('build'));
morgan.token('body', (req) => {
    return req.method === 'POST' ? JSON.stringify(req.body) : '';
});

app.use(
    morgan(
        ':method :url :status :res[content-length] - :response-time ms :body'
    )
);

const errorHandler = (error, request, response, next) => {
    console.log(error.message);
    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' });
    } else if (error.name === 'ValidationError') {
        return response.status(500).json({ error: error.message });
    }
    next(error);
};

app.get('/', (request, response) => {
    response.send('<h1>Hello World! </h1>');
});

app.get('/info', (request, response) => {
    response.send(
        `<p>Phonebook has info for ${
            response.length
        } people.<br/> </p> ${new Date().toString()}`
    );
});

app.get('/api/persons', (request, response) => {
    Person.find({}).then((persons) => {
        response.json(persons);
    });
});

app.get('/api/persons/:id', (request, response) => {
    Person.findById(request.params.id).then((person) => {
        if (person) {
            response.json(person);
        } else {
            response.status(404).end();
        }
    });
});

app.post('/api/persons', (request, response, next) => {
    const body = request.body;
    if (!body.name) {
        return response.status(500).json({
            error: 'name missing!',
        });
    }
    if (!body.number) {
        return response.status(500).json({
            error: 'number missing!',
        });
    }
    const person = new Person({
        name: body.name,
        number: body.number,
    });
    Person.findOne({ name: body.name }).then((res) => {
        if (!res) {
            console.log('person not found');
            person
                .save()
                .then((savedPerson) => {
                    response.json(savedPerson);
                })
                .catch((error) => next(error));
        } else {
            response.status(500).json({
                error: 'Person already exist',
            });
        }
    });
});

app.put('/api/persons/:id', (request, response, next) => {
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
    const person = {
        name: body.name,
        number: body.number,
    };
    Person.findByIdAndUpdate(request.params.id, person, { new: true })
        .then((updatedPerson) => {
            response.json(updatedPerson);
        })
        .catch((error) => next(error));
});

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
        .then(() => {
            response.status(204).end();
        })
        .catch((error) => next(error));
});

app.use(errorHandler);
const PORT = process.env.PORT || 3001;
app.listen(PORT);
console.log(`Server running on port${PORT}`);
