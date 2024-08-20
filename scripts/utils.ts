import fs from 'fs'

interface CommonWriteFileArgs {
  path: string
  log: { success: string; error: string }
}

interface WriteFileArgs extends CommonWriteFileArgs {
  data: any
}

interface WriteFileFromPromiseArgs extends CommonWriteFileArgs {
  data: PromiseFulfilledResult<any> | PromiseRejectedResult
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

export const writeFileFromPromise = (args: WriteFileFromPromiseArgs) => {
  const { path, data, log } = args

  if (data.status === 'fulfilled') {
    fs.writeFile(path, JSON.stringify(data.value), (err) => {
      if (err) {
        console.error(log.error)
        throw err
      }
      console.info(log.success)
    })
  } else {
    console.error(log.error)
    console.error(data.reason)
  }
}
