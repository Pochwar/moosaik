import express from 'express'
import multer from 'multer'
import path from 'path'
import ejs from 'ejs'
import Controller from 'Controller'

export default class Server {
  constructor() {
    // init app server
    this._app = express()

    // use multer for file uploads
    const upload = multer({ dest: 'src/uploads' })

    // set public directory where to put client css an js files
    this._app.use(express.static(path.join(__dirname, '/../public')))

    // set template engine
    this._app.set('view engine', 'ejs')
    this._app.set('views', path.join(__dirname, '../src/views/'));

    // set app port
    this.port = 2440;

    // Routes
    const controller = new Controller()
    this._app.get('/', controller.index.bind(controller))
    this._app.get('/create', controller.create.bind(controller))
    this._app.post('/create', upload.single('original'), controller.store.bind(controller))
  }

  run() {
    this._app.listen(this.port, () => console.log(`Server available at http://localhost:${this.port}!`));
  }
}
