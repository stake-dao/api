
import memoize from 'memoizee'
import { MEMO_MAX_AGE } from '../utils';
import tokens from '../../../api/tokens/index.json'

const API_URL = 'https://api.github.com/repos/oo-00/Votium/contents/merkle';
const MERKLE_API_BASE = 'https://raw.githubusercontent.com/oo-00/Votium/refs/heads/main/merkle/'

async function getSubdirectories(url:string) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Erreur : ${response.status} ${response.statusText}`);
        const data = await response.json();
        return data.filter(item => item.type === "dir").map(item => item.name);
    } catch (error) {
        console.error(error);
        return [];
    }
}

function findToken(symbol:string) {
    return tokens.find((t) => t.symbol.toLowerCase() === symbol.toLowerCase())
}

function getTokenMerkle(symbol:string) {
    return `${MERKLE_API_BASE}/${symbol}/${symbol}.json`
}

const processVotiumMerkles = async() => {
    const subdirectories = await getSubdirectories(API_URL);
    const output = { claims : {} }
    for(const symbol of subdirectories){
        const token = findToken(symbol)
        if(!token) continue
        const merkle = await fetch(getTokenMerkle(symbol)).then((res) => res.json())
        for(const user of Object.keys(merkle.claims)){
            if(!output.claims[user]){
                output.claims[user] = {
                    tokens : {
                        [token.address] : {
                            index: merkle.claims[user].index,
                            amount: merkle.claims[user].amount,
                            proof: merkle.claims[user].proof
                        }
                    }
                }
            } else {
                output.claims[user].tokens[token.address] = {
                    index: merkle.claims[user].index,
                    amount: merkle.claims[user].amount,
                    proof: merkle.claims[user].proof
                }
            }
        }
    }
    return output
}

export const getVotiumMerkles = memoize(
    async () => {
      return await processVotiumMerkles()
    },
    { maxAge: MEMO_MAX_AGE },
)