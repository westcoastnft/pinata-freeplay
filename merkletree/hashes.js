//import { defaultAbiCoder } from '@ethersproject/abi';
//import { keccak256 } from '@ethersproject/keccak256';
import { concat, compare } from './bytes.js';
export function standardLeafHash(types, value) {
    return ethers.utils.keccak256(ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(types, value)));
}
export function standardNodeHash(a, b) {
    return ethers.utils.keccak256(concat([a, b].sort(compare)));
}
//# sourceMappingURL=hashes.js.map
