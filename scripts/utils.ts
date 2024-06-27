import fs from 'fs'

interface WriteFileArgs {
  path: string
  data: any
  log: { success: string; error: string }
}

export const writeFile = (args: WriteFileArgs) => {
  const { path, data, log } = args
  
  fs.writeFile(path, data, (err) => {
    if (err) {
      console.error(log.error)
      throw err
    }
    console.info(log.success)
  })
}
