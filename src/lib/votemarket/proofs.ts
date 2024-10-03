import fs from 'fs';
import path from 'path';

export interface ProofData {
  epoch: number;
  name: string;
  gauge_controller_proof: string;
  platforms: {
    [platform: string]: {
      chain_id: number;
      platform_address: string;
      block_number: number;
      gauges: {
        [gauge: string]: {
          point_data_proof: string;
          users: {
            [user: string]: {
              storage_proof: string;
              last_vote: number;
              slope: number;
              power: number;
              end: number;
            };
          };
          blacklisted_users: {
            [user: string]: {
              storage_proof: string;
            };
          };
        };
      };
    };
  };
}

export interface BlockData {
  epoch: number;
  block_header: {
    BlockNumber: number;
    BlockHash: string;
    BlockTimestamp: number;
    RlpBlockHeader: string;
  };
}

const BASE_DIR = 'api/votemarket';

export async function getProofs(protocol: string, period: number): Promise<ProofData | null> {
  const filePath = path.join(BASE_DIR, period.toString(), `${protocol}_active_proofs.json`);

  return new Promise((resolve) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error(`Error reading file ${filePath}: ${err}`);
        resolve(null);
        return;
      }

      try {
        const proofData: ProofData = JSON.parse(data);
        resolve(proofData);
      } catch (error) {
        console.error(`Error parsing JSON from ${filePath}: ${error}`);
        resolve(null);
      }
    });
  });
}

export async function getBlockData(period: number): Promise<BlockData | null> {
  const filePath = path.join(BASE_DIR, period.toString(), 'block_data.json');

  return new Promise((resolve) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error(`Error reading file ${filePath}: ${err}`);
        resolve(null);
        return;
      }

      try {
        const blockData: BlockData = JSON.parse(data);
        resolve(blockData);
      } catch (error) {
        console.error(`Error parsing JSON from ${filePath}: ${error}`);
        resolve(null);
      }
    });
  });
}

export function getGaugeData(data: ProofData, gaugeAddress: string) {
  for (const platform of Object.values(data.platforms)) {
    if (gaugeAddress in platform.gauges) {
      return platform.gauges[gaugeAddress];
    }
  }
  return null;
}

export function getUserData(data: ProofData, gaugeAddress: string, userAddress: string) {
  const gaugeData = getGaugeData(data, gaugeAddress);
  return gaugeData?.users[userAddress] || null;
}

export function getBlacklistData(data: ProofData, gaugeAddress: string) {
  const gaugeData = getGaugeData(data, gaugeAddress);
  return gaugeData?.blacklisted_users || null;
}