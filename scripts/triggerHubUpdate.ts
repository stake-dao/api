const STAKE_DAO_HUB = 'https://hub.stakedao.org'
const config = { method: 'POST' }

const triggerHubUpdate = async () => {
  await Promise.all([
    fetch(`${STAKE_DAO_HUB}/update/curve`, config).then(res => res.json()),
    fetch(`${STAKE_DAO_HUB}/update/balancer`, config).then(res => res.json()),
  ])
}

triggerHubUpdate()
