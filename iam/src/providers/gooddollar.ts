// ----- Types
import type { Provider, ProviderOptions } from "../types";
import type { RequestPayload, VerifiedPayload } from "@gitcoin/passport-types";

// ------ Ethers Library
import { utils, Contract } from "ethers";
import { StaticJsonRpcProvider } from "@ethersproject/providers";

// ------ GoodDollar identity ABI & Address
import Identity from "@gooddollar/goodprotocol/artifacts/contracts/Interfaces.sol/IIdentity.json";
const IDENTITY_ADDRESS_FUSE = "0xFa8d865A962ca8456dF331D78806152d3aC5B84F";

const fuse_rpc = process.env.RPC_FUSE_URL || "https://rpc.fuse.io"; //TODO: add env to build-process

export class GoodDollarProvider implements Provider {
  // Give the provider a type so that we can select it with a payload
  type = "GoodDollar";
  // Options can be set here and/or via the constructor
  _options = {};

  // construct the provider instance with supplied options
  constructor(options: ProviderOptions = {}) {
    this._options = { ...this._options, ...options };
  }

  // verify that the proof object contains valid === "true"
  async verify(payload: RequestPayload): Promise<VerifiedPayload> {
    const { address, proofs } = payload;

    try {
      const providerFuse: StaticJsonRpcProvider = new StaticJsonRpcProvider(fuse_rpc);
      const contract = new Contract(IDENTITY_ADDRESS_FUSE, Identity.abi, providerFuse);
      const whitelistedAddress = proofs.whitelistedAddress;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
      const valid: boolean = await contract.isWhitelisted(whitelistedAddress);

      return {
        valid,
        record: valid
          ? {
              // store the address into the proof records
              address,
              whitelistedAddress,
            }
          : undefined,
      };
    } catch (e) {
      return {
        valid: false,
        error: [JSON.stringify(e)],
      };
    }
  }
}
