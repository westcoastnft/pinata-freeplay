//import { arrayify as toBytes, hexlify as toHex, concat } from '@ethersproject/bytes';
function compare(a, b) {
    const diff = BigInt(toHex(a)) - BigInt(toHex(b));
    return diff > 0 ? 1 : diff < 0 ? -1 : 0;
}
const toBytes = ethers.utils.arrayify
const toHex = ethers.utils.hexlify
const concat = ethers.utils.concat
export { toBytes, toHex, concat, compare };
//# sourceMappingURL=bytes.js.map
