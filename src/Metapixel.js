import getDateTime from './utils';

var util = require('util')
var exec = util.promisify(require('child_process').exec)
const fs = require('fs')
import ProjectRepository from 'repositories/ProjectRepository'

export default class Metapixel {
  run(project) {
    return new Promise((resolve, reject) => {
      const projectRepository = new ProjectRepository()
      const source_folder = `./src/giftuh/downloaded_images/${project.id}/${project.keyword}`
      const original = `./src/metapixel/originals/${project.original}`

      // Count files in library
      fs.readdir(source_folder, (err, files) => {
        if (err){
          console.log(err)
        } else {
          console.log(getDateTime())
          console.log('########################################')
          console.log(`# Creating mozaic`)
          console.log('########################################')
          console.log(`# Number of files: ${files.length}`)

          // check if there are enough files to create mozaic
          if (files.length < 50) {
            console.log('Not enough files, need at least 50 files.')
            resolve()
          }
          // check if files have been added since last mosaic build
          else if (files.length == project.last_nb_files){
            console.log('No files added since last build')
            resolve()
          }
          else {
            projectRepository.updateNbFiles(project.id, files.length)
            this.mozaic(project.id, source_folder, 250, 250, original, 3)
              .then(() => {
                resolve()
              })
              .catch(err => {
                reject(err)
              })
          }
        }
      })
    })
  }

  async mozaic(id, source_folder, width, height, original, scale) {
    const output=`public/img/mosaics/mosaic_${id}.png`

    console.log('\nPreparing miniatures')
    var { stdout, stderr } = await exec(`metapixel-prepare --recurse ${source_folder} src/metapixel/tmp_img --width=${width} --height=${height}`);
    console.log('stdout:', stdout)
    console.log('stderr:', stderr)

    console.log('\nBuilding mozaic')
    var { stdout, stderr } = await exec(`metapixel --library src/metapixel/tmp_img --metapixel ${original} ${output} --scale=${scale}`);
    console.log('stdout:', stdout)
    console.log('stderr:', stderr)

    console.log('\nCleaning miniatures')
    var { stdout, stderr } = await exec('/bin/rm -f src/metapixel/tmp_img/*');
    console.log('stdout:', stdout)
    console.log('stderr:', stderr)

    console.log('\nRecreate .gitkeep')
    var { stdout, stderr } = await exec('/bin/touch src/metapixel/tmp_img/.gitkeep');
    console.log('stdout:', stdout)
    console.log('stderr:', stderr)
  }
}





