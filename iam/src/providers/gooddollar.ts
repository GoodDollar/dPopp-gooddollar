// ----- Types
import type { Provider, ProviderOptions } from "../types";
import type { RequestPayload, VerifiedPayload } from "@gitcoin/passport-types";

// ------ SDK
import { parseLoginResponse } from "client-sdk-gooddollar";

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
    // const { address } = payload;
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
