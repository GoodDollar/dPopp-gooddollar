// ----- Types
import type { Provider, ProviderOptions } from "../types";
import type { RequestPayload, VerifiedPayload } from "@gitcoin/passport-types";

// ------ Ethers Library
import { utils, Contract } from "ethers";
import { StaticJsonRpcProvider } from "@ethersproject/providers";

// ------ GoodDollar identity ABI & Address
import Identity from "@gooddollar/goodprotocol/artifacts/contracts/Interfaces.sol/IIdentity.json";
const IDENTITY_ADDRESS = "0x76e76e10Ac308A1D54a00f9df27EdCE4801F288b";

// Export a simple Provider as an example
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
      const provider: StaticJsonRpcProvider = new StaticJsonRpcProvider(process.env.RPC_URL);
      const identifyInterface = new utils.Interface(Identity.abi);
      const contract = new Contract(IDENTITY_ADDRESS, identifyInterface, provider);
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
