import Mongoose from 'mongoose'
import _ from 'lodash'
import conf from 'config'

export default class DBConnector {
  constructor() {
    this.conf = {
      user:conf.db_user,
      password:conf.db_password,
      host:conf.db_host,
      port:conf.db_port,
      database:conf.db_name
    }
    this.mongoose = Mongoose
    if (conf.app_debug == '1') {
      console.log('DB debug mode ON')
      this.mongoose.set('debug', true)
    }
  }

  connect() {
    return new Promise((resolve, reject) => {
      Mongoose.Promise = global.Promise;
      let dbCredentials = '';
      if(!_.isEmpty(this.conf.user)) {
        dbCredentials = this.conf.user + ':' + this.conf.password + '@'
      }
      this.mongoose.connect(
        `mongodb://${dbCredentials}${this.conf.host}:${this.conf.port}/${this.conf.database}`,
        {
          useNewUrlParser: true,
          useCreateIndex: true
        },
        err => {
          if(err)
            reject(err);
          else
            resolve("Connected to MongoDB");
        }
      )
    })
  }
}