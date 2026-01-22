import fs from 'fs'

interface CommonFileArgs {
  path: string
  log: { success: string; error: string }
}

interface WriteFileArgs extends CommonFileArgs {
  data: any
}

interface WriteFileFromPromiseArgs extends CommonFileArgs {
  data: PromiseFulfilledResult<any> | PromiseRejectedResult
}

export const readFile = (args: { path: string }) => {
  const { path } = args

  const fileContent = fs.readFileSync(path, 'utf-8')

  return JSON.parse(fileContent)
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

export const chunk = (array, size = 5) => {
  return Array.from({ length: Math.ceil(array.length / size) }, (_, i) => array.slice(i * size, i * size + size))
}

export const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
