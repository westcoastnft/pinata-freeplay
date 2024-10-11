import { toHex } from './bytes.js';
import { processProof, processMultiProof } from './core.js';
import { MerkleTreeImpl } from './merkletree.js';
import { standardLeafHash } from './hashes.js';
import { validateArgument } from './utils/errors.js';
export class StandardMerkleTree extends MerkleTreeImpl {
    constructor(tree, values, leafEncoding) {
        super(tree, values, leaf => standardLeafHash(leafEncoding, leaf));
        this.tree = tree;
        this.values = values;
        this.leafEncoding = leafEncoding;
    }
    static of(values, leafEncoding, options = {}) {
        // use default nodeHash (standardNodeHash)
        const [tree, indexedValues] = MerkleTreeImpl.prepare(values, options, leaf => standardLeafHash(leafEncoding, leaf));
        return new StandardMerkleTree(tree, indexedValues, leafEncoding);
    }
    static load(data) {
        validateArgument(data.format === 'standard-v1', `Unknown format '${data.format}'`);
        validateArgument(data.leafEncoding !== undefined, 'Expected leaf encoding');
        const tree = new StandardMerkleTree(data.tree, data.values, data.leafEncoding);
        tree.validate();
        return tree;
    }
    static verify(root, leafEncoding, leaf, proof) {
        // use default nodeHash (standardNodeHash) for processProof
        return toHex(root) === processProof(standardLeafHash(leafEncoding, leaf), proof);
    }
    static verifyMultiProof(root, leafEncoding, multiproof) {
        // use default nodeHash (standardNodeHash) for processMultiProof
        return (toHex(root) ===
            processMultiProof({
                leaves: multiproof.leaves.map(leaf => standardLeafHash(leafEncoding, leaf)),
                proof: multiproof.proof,
                proofFlags: multiproof.proofFlags,
            }));
    }
    dump() {
        return {
            format: 'standard-v1',
            leafEncoding: this.leafEncoding,
            tree: this.tree,
            values: this.values,
        };
    }
}
//# sourceMappingURL=standard.js.map
