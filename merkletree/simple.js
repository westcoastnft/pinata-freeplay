//import { defaultAbiCoder } from '@ethersproject/abi';
import { toHex } from './bytes.js';
import { processProof, processMultiProof } from './core.js';
import { MerkleTreeImpl } from './merkletree.js';
import { validateArgument } from './utils/errors.js';
export function formatLeaf(value) {
    return ethers.utils.defaultAbiCoder.encode(['bytes32'], [value]);
}
export class SimpleMerkleTree extends MerkleTreeImpl {
    static of(values, options = {}) {
        const [tree, indexedValues] = MerkleTreeImpl.prepare(values, options, formatLeaf, options.nodeHash);
        return new SimpleMerkleTree(tree, indexedValues, formatLeaf, options.nodeHash);
    }
    static load(data, nodeHash) {
        validateArgument(data.format === 'simple-v1', `Unknown format '${data.format}'`);
        validateArgument((nodeHash == undefined) !== (data.hash == 'custom'), nodeHash ? 'Data does not expect a custom node hashing function' : 'Data expects a custom node hashing function');
        const tree = new SimpleMerkleTree(data.tree, data.values, formatLeaf, nodeHash);
        tree.validate();
        return tree;
    }
    static verify(root, leaf, proof, nodeHash) {
        return toHex(root) === processProof(formatLeaf(leaf), proof, nodeHash);
    }
    static verifyMultiProof(root, multiproof, nodeHash) {
        return toHex(root) === processMultiProof(multiproof, nodeHash);
    }
    dump() {
        return {
            format: 'simple-v1',
            tree: this.tree,
            values: this.values.map(({ value, treeIndex }) => ({ value: toHex(value), treeIndex })),
            ...(this.nodeHash ? { hash: 'custom' } : {}),
        };
    }
}
//# sourceMappingURL=simple.js.map
