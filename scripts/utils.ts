import fs from 'fs'

export const writeFile = (path: string, data: any, log: { success: string, error: string }) => {
  fs.writeFile(
    path,
    data,
    (err) => {
      if (err) {
        console.error(log.error);
        throw err;
      }
      console.info(log.success);
    }
  );
};
