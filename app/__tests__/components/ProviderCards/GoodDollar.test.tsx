import React from "react";
import { render, screen, fireEvent, waitFor, waitForElementToBeRemoved } from "@testing-library/react";
import { GoodDollarCard } from "../../../components/ProviderCards";

import { UserContext, UserContextState } from "../../../context/userContext";
import { mockAddress, mockWallet } from "../../../__test-fixtures__/onboardHookValues";
import { STAMP_PROVIDERS } from "../../../config/providers";
import { gooddollarStampFixture } from "../../../__test-fixtures__/databaseStorageFixtures";
import { SUCCESFULL_GOODDOLLAR_RESULT } from "../../../__test-fixtures__/verifiableCredentialResults";
import { fetchVerifiableCredential } from "@gitcoin/passport-identity/dist/commonjs/src/credentials";

jest.mock("@gitcoin/passport-identity/dist/commonjs/src/credentials", () => ({
  fetchVerifiableCredential: jest.fn(),
}));
jest.mock("../../../utils/onboard.ts");

const mockHandleConnection = jest.fn();
const mockCreatePassport = jest.fn();
const handleAddStamp = jest.fn().mockResolvedValue(undefined);
const mockUserContext: UserContextState = {
  userDid: undefined,
  loggedIn: true,
  passport: {
    issuanceDate: new Date(),
    expiryDate: new Date(),
    stamps: [],
  },
  isLoadingPassport: false,
  allProvidersState: {
    GoodDollar: {
      providerSpec: STAMP_PROVIDERS.GoodDollar,
      stamp: undefined,
    },
  },
  handleAddStamp: handleAddStamp,
  handleCreatePassport: mockCreatePassport,
  handleConnection: mockHandleConnection,
  address: mockAddress,
  wallet: mockWallet,
  signer: undefined,
  walletLabel: mockWallet.label,
};

describe("when user has not verfied with GoodDollarProvider", () => {
  it("should display a verification button", () => {
    render(
      <UserContext.Provider value={mockUserContext}>
        <GoodDollarCard />
      </UserContext.Provider>
    );

    const verifyButton = screen.queryByTestId("button-verify-gooddollar");

    expect(verifyButton).toBeInTheDocument();
  });
});

describe("when user has verified with GoodDollarProvider", () => {
  it("should display is verified", () => {
    render(
      <UserContext.Provider
        value={{
          ...mockUserContext,
          allProvidersState: {
            GoodDollar: {
              providerSpec: STAMP_PROVIDERS.GoodDollar,
              stamp: gooddollarStampFixture,
            },
          },
        }}
      >
        <GoodDollarCard />
      </UserContext.Provider>
    );

    const verified = screen.queryByText(/Verified/);

    expect(verified).toBeInTheDocument();
  });
});

// describe("when the verify button is clicked", () => {
//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   describe("and when a successful GoodDollar result is returned", () => {
//     beforeEach(() => {
//       (fetchVerifiableCredential as jest.Mock).mockResolvedValue(SUCCESFULL_GOODDOLLAR_RESULT);
//     });

//     it("after returned from succesfull login, the localStorage item is set ", async () => {
//       render(
//         <UserContext.Provider value={mockUserContext}>
//           <GoodDollarCard />
//         </UserContext.Provider>
//       );

//       const initialVerifyButton = screen.queryByTestId("button-verify-gooddollar");

//       fireEvent.click(initialVerifyButton!);

//       // const setItem = jest.spyOn(Object.getPrototypeOf(localStorage), 'setItem');

//       // expect(setItem).toHaveBeenCalled();
//     });

// it("clicking verify adds the stamp", async () => {
//   render(
//     <UserContext.Provider value={mockUserContext}>
//       <GoodDollarCard />
//     </UserContext.Provider>
//   );

//   const initialVerifyButton = screen.queryByTestId("button-verify-gooddollar");

//   // Click verify button on gooddollar card
//   fireEvent.click(initialVerifyButton!);

//   await waitFor(() => {
//     expect(handleAddStamp).toBeCalled();
//   });

//   // Wait to see the done toast
//   await waitFor(() => {
//     const doneToast = screen.getByTestId("toast-done-gooddollar");
//     expect(doneToast).toBeInTheDocument();
//   });
// });
//   });
// });

//   describe("and when verifying returns an error", () => {
//     it("removes the localStorage item", async () => {
//       (fetchVerifiableCredential as jest.Mock).mockRejectedValue("ERROR");
//       render(
//         <UserContext.Provider value={mockUserContext}>
//           <GoodDollarCard />
//         </UserContext.Provider>
//       );

//       const initialVerifyButton = screen.queryByTestId("button-verify-gooddollar");

//       fireEvent.click(initialVerifyButton!);

//       const removeItem = jest.spyOn(Object.getPrototypeOf(localStorage), 'removeItem');

//       expect(removeItem).toHaveBeenCalled();
//     });

//     it("Shows a toast that the verification failed", async () => {
//       (fetchVerifiableCredential as jest.Mock).mockRejectedValue("ERROR");
//       render(
//         <UserContext.Provider value={mockUserContext}>
//           <GoodDollarCard />
//         </UserContext.Provider>
//       );

//       const initialVerifyButton = screen.queryByTestId("button-verify-gooddollar");

//       fireEvent.click(initialVerifyButton!);

//       await waitFor(() => {
//         const doneToast = screen.getByTestId("toast-gd-failed-verification-title");
//         expect(doneToast).toBeInTheDocument();
//       });
//     })
// });
// });
