// ---- Test subject
import { GoodDollarProvider } from "../src/providers/gooddollar";

const MOCK_ADDRESS = "0x738488886dd94725864ae38252a90be1ab7609c7";
const MOCK_ADDRESS2 = "0x738488886dd94725864ae38252a90be1ab7609c2";

const mockIsWhitelisted = jest.fn();

const MOCK_REQUEST_PAYLOAD = {
  type: "GoodDollar",
  address: MOCK_ADDRESS,
  version: "0.0.0",
  proofs: {
    whitelistedAddress: MOCK_ADDRESS2
  },
  challenge: ""
}

const MOCK_INVALID_REQUEST_PAYLOAD = {
  type: "GoodDollar",
  address: "0xUNREGISTERED",
  version: "0.0.0",
  proofs: {
    whitelistedAddress: "0xUNREGISTERED"
  },
  challenge: ""
}

jest.mock("ethers", () => {
  return {
    Contract: jest.fn().mockImplementation(() => {
      return {
        isWhitelisted: mockIsWhitelisted,
      };
    }),
  };
});

describe("Attempt verification", function () {
  it("should return true for an address whitelisted with gooddollar", async () => {
    mockIsWhitelisted.mockResolvedValueOnce(true);
    const gd = new GoodDollarProvider();
    const verifiedPayload = await gd.verify(MOCK_REQUEST_PAYLOAD);

    expect(mockIsWhitelisted).toBeCalledWith(MOCK_ADDRESS2);

    expect(verifiedPayload).toEqual({
      valid: true,
      record: {
        address: MOCK_ADDRESS,
        whitelistedAddress: MOCK_ADDRESS2,
      },
    });
  });

  it("should return false for an address that is not whitelisted with gooddollar", async () => {
    mockIsWhitelisted.mockResolvedValueOnce(false);
    const UNREGISTERED_ADDRESS = "0xUNREGISTERED";

    const gd = new GoodDollarProvider();
    const verifiedPayload = await gd.verify(MOCK_INVALID_REQUEST_PAYLOAD);

    expect(mockIsWhitelisted).toBeCalledWith(UNREGISTERED_ADDRESS);
    expect(verifiedPayload).toEqual({
      valid: false,
    });
  });

  it("should return error response when isWhitelisted call errors", async () => {
    mockIsWhitelisted.mockRejectedValueOnce("some error");
    const UNREGISTERED_ADDRESS = "0xUNREGISTERED";

    const gd = new GoodDollarProvider();
    const verifiedPayload = await gd.verify(MOCK_INVALID_REQUEST_PAYLOAD);

    expect(mockIsWhitelisted).toBeCalledWith(UNREGISTERED_ADDRESS);
    expect(verifiedPayload).toEqual({
      valid: false,
      error: [JSON.stringify("some error")],
    });
  });
});
