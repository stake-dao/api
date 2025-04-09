import { writeFile } from '../utils'
import { getVotiumMerkles } from '../../src/lib/votemarket/getVotiumMerkles'

const updateVotiumMerkles = async () => {
  const votiumMerkles = await getVotiumMerkles()

  writeFile({
    path: `api/votemarket/votium_merkles.json`,
    data: JSON.stringify(votiumMerkles),
    log: {
      success: '✅ - Votium merkles have been updated!',
      error: '❌ - An error occured during the Votium merkles update.',
    },
  })

  {
    /* // Parquet storage
  const schema = new parquet.ParquetSchema({
    user: { type: 'UTF8' },
    token: { type: 'UTF8' },
    index: { type: 'INT32' },
    amount: { type: 'INT64' },
    proof: { type: 'UTF8', repeated: true }
  });

  const writer = await parquet.ParquetWriter.openFile(schema, 'api/votemarket/votium_merkles.parket');

        for (const [user, userData] of Object.entries(votiumMerkles.claims)) {
          for (const [token, data] of Object.entries((userData as any).tokens)) {
              await writer.appendRow({
                  user: user,
                  token: token,
                  index: (data as any).index,
                  amount: (data as any).amount,
                  proof: (data as any).proof
              });
          }
      }
    await writer.close();  
    
  */
  }
}

updateVotiumMerkles()
