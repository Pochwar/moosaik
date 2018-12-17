import schedule from 'node-schedule'
import Server from 'Server'
import DBConnector from 'DBConnector'
import Metapixel from 'Metapixel'
import Giftuh from 'Giftuh'
import ProjectRepository from "repositories/ProjectRepository"

// Configuration
import conf from 'config'
const library = './src/giftuh/downloaded_images'

// Connect to DB
const dbConnector = new DBConnector()
dbConnector.connect()
  .then(async msg => {
    console.log(msg)

    // get project
    const projectRepository = new ProjectRepository()
    let project = await projectRepository.getLastProject()

    // Launch server
    const server = new Server()
    server.run()

    // Get Images From Twitter Using Hashtag
    const giftuh = new Giftuh()
    if(conf.run_giftuh == 1) {
      giftuh.run(project)
      // check if project has changed
      setInterval(async function() {
        const actualProject = await projectRepository.getLastProject()
        if (actualProject.id != project.id) {
          giftuh.stop()
          project = actualProject
          giftuh.run(project)
        }
      }, 1000)
    } else {
      console.log('Giftuh process: OFF')
    }

    // Build mozaic using metapixel
    const metapixel = new Metapixel()
    if(conf.run_metapixel == 1) {
      console.log(`RUN METAPIXEL EVERY ${conf.mtpx_periodicity} MINUTES`)
      schedule.scheduleJob(`*/${conf.mtpx_periodicity}  * * * *`, async function() {
        // Mute Giftuh stream
        giftuh.mute()

        // Get project
        const project = await projectRepository.getLastProject()
        const original = `./src/metapixel/originals/${project.original}`

        // Run metapixel
        metapixel.run(library, project.keyword, original, project.id)
          .then(() => {
            giftuh.unmute()
          })
          .catch(err => {
            console.log(err)
          })

      })
    }else {
      console.log('Metapixel process: OFF')
    }
  })
  .catch(err => {
    console.log(err)
  })