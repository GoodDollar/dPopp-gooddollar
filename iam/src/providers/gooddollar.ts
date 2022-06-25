// ----- Types
import type { Provider, ProviderOptions } from "../types";
import type { RequestPayload, VerifiedPayload } from "@gitcoin/passport-types";

// ------ SDK
import { parseLoginResponse } from "@gooddollar/goodlogin-sdk";

// ------ Ethers Library
import { Contract, ContractInterface } from "ethers";
import { StaticJsonRpcProvider } from "@ethersproject/providers";

// ------ GoodDollar identity ABI & Address
import Identity from "@gooddollar/goodprotocol/artifacts/contracts/Interfaces.sol/IIdentity.json";
const IDENTITY_ADDRESS = "0x76e76e10Ac308A1D54a00f9df27EdCE4801F288b";
interface isValidGooddollar {
  isWhiteListed?: boolean;
}

// Export a simple Provider as an example
export class GoodDollarProvider implements Provider {
  // Give the provider a type so that we can select it with a payload
  type = "GoodDollar";
  // Options can be set here and/or via the constructor
  _options = {
    valid: "true",
  };

  // construct the provider instance with supplied options
  constructor(options: ProviderOptions = {}) {
    this._options = { ...this._options, ...options };
  }

  // verify that the proof object contains valid === "true"
  async verify(payload: RequestPayload): Promise<VerifiedPayload> {
    const { address } = payload;
    try {
      const provider: StaticJsonRpcProvider = new StaticJsonRpcProvider(process.env.RPC_URL);
      const identity = Identity.abi as ContractInterface;
      const contract = new Contract(IDENTITY_ADDRESS, Identity.abi as ContractInterface, provider);
      // const valid: boolean = await contract.methods.isWhitelisted(address).call();

      // return {
      //   valid,
      //   record: valid
      //   ? {
      //       address,
      //     }
      //   : undefined
      // };
    } catch (e) {
      return {
        valid: false,
        error: [JSON.stringify(e)],
      };
    }
    // let valid = false;
    // verifiedPayload: isValidGooddollar = {};
    // try {
    //   verifiedPayload = await verifyGoodDollar(payload.proofs?.address)
    // } catch {

    return Promise.resolve({
      valid: payload.proofs?.valid === this._options.valid,
      record: {
        username: payload?.proofs?.username || "",
      },
    });
  }
}

// async function verifyGoodDollar(address: string){
//   const checkWhiteListed = parseLoginResponse(address)

//   return {
//     isWhiteListed: true,
//   };
// }
