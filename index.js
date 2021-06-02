const express = require('express')
const { spawn } = require('child_process')
const app = express()
var multer = require('multer')
var cors = require('cors');
const port = 3000

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
})
var upload = multer({ storage: storage }).single('file')

app.post('/upload', (req, res) => {

    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(500).json(err)
        } else if (err) {
            return res.status(500).json(err)
        }
        return res.status(200).send(req.file)

    })

})

app.get('/', (req, res) => {
    var dataToSend;
    // spawn new child process to call the python script

    const python = spawn('python', ['aenn2_v1.py']);

    // collect data from script
    python.stdout.on('data', function (data) {
        console.log('Pipe data from python script ...');
        let json = JSON.stringify(data);
        console.log(typeof (json));
        dataToSend = data.toString();
    });
    // in close event we are sure that stream from child process is closed
    python.on('close', (code) => {
        console.log(`child process close all stdio with code ${code}`);
        // send data to browser
        res.send(dataToSend)
    });
})

app.listen(port, () => {
    console.log(`App listening on port ${port}!`)
})
