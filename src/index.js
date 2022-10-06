import schedule from 'node-schedule'
import Server from 'Server'
import DBConnector from 'DBConnector'
import Metapixel from 'Metapixel'
import Giftuh from 'Giftuh'
import ProjectRepository from 'repositories/ProjectRepository'
import defaultProject from 'seed/project'
import getDateTime from './utils';

// Configuration
import conf from 'config'

// Connect to DB
const dbConnector = new DBConnector()
dbConnector.connect()
  .then(async msg => {
    console.log(getDateTime());
    console.log(msg)

    // get project
    const projectRepository = new ProjectRepository()
    let project = await projectRepository.getLastProject()

    // Create default project if none
    if (project == undefined) {
      console.log('Create initial default project');
      project = await projectRepository.createProject(defaultProject)
    }

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

        // Run metapixel
        metapixel.run(project)
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
