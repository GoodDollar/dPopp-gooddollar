// --- React Methods
import React, { useContext, useState } from "react";

// --- Datadog
import { datadogLogs } from "@datadog/browser-logs";
import { datadogRum } from "@datadog/browser-rum";

// --- Identity tools
import { fetchVerifiableCredential } from "@gitcoin/passport-identity/dist/commonjs/src/credentials";

// pull context
import { UserContext } from "../../context/userContext";

import { PROVIDER_ID, Stamp } from "@gitcoin/passport-types";
import { ProviderSpec } from "../../config/providers";

const iamUrl = process.env.NEXT_PUBLIC_DPOPP_IAM_URL || "";

// --- import components
import { Card } from "../Card";
import { VerifyModal } from "../VerifyModal";
import { useDisclosure, useToast } from "@chakra-ui/react";
import { DoneToastContent } from "../DoneToastContent";

const providerId: PROVIDER_ID = "GoodDollar";

export default function GoodDollarCard(): JSX.Element {
  const { address, signer, handleAddStamp, allProvidersState } = useContext(UserContext);
  const [isLoading, setLoading] = useState(false);

  const handleFetchGoodCredential = (): void => {};

  const issueCredentialWidget = (
    <button data-testid="button-verify-gooddollar" className="verify-btn" onClick={handleFetchGoodCredential}>
      Connect account
    </button>
  );

  return (
    <Card
      isLoading={isLoading}
      providerSpec={allProvidersState[providerId]!.providerSpec as ProviderSpec}
      issueCredentialWidget={issueCredentialWidget}
    />
  );
}
