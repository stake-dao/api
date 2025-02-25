import { writeFile } from '../utils'
import { getVotiumMerkles } from '../../src/lib/votemarket/getVotiumMerkles';

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
}

updateVotiumMerkles()