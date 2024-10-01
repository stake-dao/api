import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { writeFile } from '../../../scripts/utils';

interface ProofData {
  block_number: number;
  period: number;
  protocol: {
    name: string;
    gauge_controller_proof: string;
    platforms: {
      [platform: string]: {
        chain_id: number;
        platform_address: string;
        gauges: {
          [gauge: string]: {
            point_data_proof: string;
            users: {
              [user: string]: {
                storage_proof: string;
                last_vote: string;
                slope: string;
                power: string;
                end: string;
              };
            };
          };
        };
      };
    };
  };
}

const TEMP_DIR = 'temp';
const OUTPUT_DIR = 'api/votemarket/proofs';

export async function generateProofs(protocols: string[], blockNumber: number, currentPeriod: number): Promise<void> {
  const command = `python votemarket-proofs-script/main.py ${protocols.join(' ')} ${blockNumber} ${currentPeriod}`;

  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing Python script: ${error}`);
        reject(error);
        return;
      }
      if (stderr) {
        console.error(`Python script stderr: ${stderr}`);
      }
      console.log(`Python script stdout: ${stdout}`);

      // Create the directory for the current period if it doesn't exist
      const periodDir = path.join(OUTPUT_DIR, currentPeriod.toString());
      fs.mkdirSync(periodDir, { recursive: true });

      // Move generated files to the API directory
      protocols.forEach((protocol) => {
        const sourceFile = path.join(TEMP_DIR, `${protocol}_active_proofs.json`);
        const destFile = path.join(periodDir, `${protocol}.json`);

        fs.readFile(sourceFile, 'utf8', (err, data) => {
          if (err) {
            console.error(`Error reading file ${sourceFile}: ${err}`);
            return;
          }

          const proofData: ProofData = JSON.parse(data);

          writeFile({
            path: destFile,
            data: JSON.stringify(proofData),
            log: {
              success: `✅ - ${protocol} proofs have been updated!`,
              error: `❌ - An error occurred during the ${protocol} proofs update.`,
            },
          });

          // Remove the temporary file
          fs.unlink(sourceFile, (err) => {
            if (err) {
              console.error(`Error deleting temporary file ${sourceFile}: ${err}`);
            }
          });
        });
      });

      resolve();
    });
  });
}

export async function getProofs(protocol: string, period: number): Promise<ProofData | null> {
  const filePath = path.join(OUTPUT_DIR, period.toString(), `${protocol}.json`);

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