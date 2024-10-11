// (c) 2024 WCNFT
// Hit The Pinata 
//

// depends on ethers lib
import { StandardMerkleTree } from "./merkletree/index.js"

const LOG_LEVEL = 0

const mainnetChainId = 81457
const testnetChainId = 168587773 

const FREEPLAY_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('FREEPLAY'))

const rpcs = {
  [mainnetChainId]: 'https://rpc.blast.io',
  [testnetChainId]: 'https://blast-sepolia.blockpi.network/v1/rpc/public',
  anvil: 'http://127.0.0.1:8545/'
}

const contracts = {
  [mainnetChainId]: '0x',
  [testnetChainId]: '0x7415a3b897F5953B862Aa8521d8653A13C92cfe8'
}


const l = (s, i=LOG_LEVEL) => i <= LOG_LEVEL ? console.log(s) : ''
const q = (selector) => document.querySelector(selector)
const qAll = (selector) => document.querySelectorAll(selector)
const e = (selector, type, f) => q(selector)?.addEventListener(type, f)
const h = (selector, s, b) => b ? q(selector).innerHTML += s : q(selector).innerHTML = s
const v = (selector, val) => val ? q(selector).value = val : q(selector)?.value

const [abiPinata] = await Promise.all([
  fetch('HitThePinata.abi.json').then(e => e.json()),
])

const fromHex = (s) => parseInt(s, 16)
const toHex = (n) => n.toString(16)
const toEth = (b, n=4) => (+ethers.utils.formatEther(b)).toFixed(n)

const getAccounts = async (provider) =>
    provider.send('eth_requestAccounts', [])

const getNetwork = async (provider) =>
    provider.send('eth_chainId', [])

const getSigner = async (provider) =>
    provider.getSigner()

const getSignature = async (provider, msg, from) =>
    provider.send('personal_sign', [msg, from])

const switchNetwork = async (provider, chainId) =>
    provider.send('wallet_switchEthereumChain', [{ chainId: `0x${toHex(chainId)}` }])

const createContract = (abi, bytecode, signer) =>
    new ethers.ContractFactory(abi, bytecode, signer)

const getContract = (address, abi, provider) =>
    new ethers.Contract(address, abi, provider)

const deploy = async (contract) => contract.deploy()

const getConfig = () => ({
    chainId: Array.from(q('.config .network').selectedOptions).map(e => parseInt(e.value))[0],
    address: v('.config .contract')
  })

v('.config .contract', contracts[testnetChainId])

// setup
let provider, account, signer, pinata, tree

e('.mm', 'click', async (e) => {
  try {
    provider = new ethers.providers.Web3Provider(window.ethereum, 'any')
  } catch (ex) {
    console.error(ex)
    h('.account', `Unable to detect MetaMask: <pre>${JSON.stringify(ex, null, 2)}</pre>`)
    return
  }
  try {
    const { chainId, address } = getConfig()
    const accounts = await getAccounts(provider)
    await switchNetwork(provider, chainId)
    const selectedChainId = await getNetwork(provider)
    h('.connection .account', `<p>Connected to chain <b>${fromHex(selectedChainId)}</b></p>`)

    account = accounts[0]
    signer = await getSigner(provider)
    pinata = getContract(address, abiPinata, signer)
    $.pinata = pinata

    const [name, symbol, supply, role] = await Promise.all([
        pinata.name(),
        pinata.symbol(),
        pinata.totalSupply(),
        pinata.hasRole(FREEPLAY_ROLE, account)
    ])

    h('.connection .contract', `
        <p>Found contract <b>${name}</b> at <b>${address}</b></p>
        <p>Total supply <b>${toEth(supply)} ${symbol}</b></p>
        <p>Account <b>${account} has FREEPLAY role ${role}</b></p>`)

    Array.from(qAll('button')).map(e => e.disabled = false)
  } catch (ex) {
    console.error(ex)
    h('.account', `Unable to connect: <pre>${JSON.stringify(ex, null, 2)}</pre>`)
  }
})

e('.merkle .merkle', 'click', async (e) => {
  try {
    
    const wallets = Array.from(new Set(v('.wallets').split('\n').filter(e => e.length)).values())
    l(wallets)
    const nonces = await pinata.getPlayersNonces(wallets)
    l(nonces)

    const values = wallets.map((w, i) => [w, nonces[i]])
    tree = StandardMerkleTree.of(values, ["address", "uint256"])
    $.tree = tree

    h('.merkleTreeResult', `<p>Merkle Root: <b>${tree.root}</b></p><p><pre>${tree.render()}</pre></p>`)


  } catch (ex) {
    console.error(ex)
    h('.merkleTreeResult', `Unable to create merkle: <pre>${JSON.stringify(ex, null, 2)}</pre>`)
  }
})

e('.sign .sign', 'click', async (e) => {
  try {
    
    const { chainId, address } = getConfig()
		const domain = {
			name: 'HitThePinata',
			version: 'v1.0',
			chainId: chainId,
			verifyingContract: address 
		}
    const types = {
      FreePlay: [{ name: 'merkleRoot', type: 'string' }]
    }
    const value = { merkleRoot: tree.root }

    const signature = await signer._signTypedData(domain, types, value)
    l(signature)
    h('.signature', `<p>Signature: <b>${signature}</b></p>`)

    const proofs = {} 
    for (const [i, v] of tree.entries()) {
      const proof = tree.getProof(i)
      const nonce = v[1].toString()
      const address = v[0]
      proofs[address] = { nonce, proof }
    }
    h('.proofs .proofs', JSON.stringify(proofs, null, 2))

  } catch (ex) {
    console.error(ex)
    h('.signature', `Unable to create signature: <pre>${JSON.stringify(ex, null, 2)}</pre>`)
  }
})

q('.mm').disabled = false

Object.assign($, { q, qAll, e, v, h, provider, pinata, tree })
