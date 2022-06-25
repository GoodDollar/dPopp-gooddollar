// ---- Test subject
import { RequestPayload } from "@gitcoin/passport-types";
import { GoodDollarProvider } from "../src/providers/gooddollar";

const mockIsRegistered = jest.fn();

jest.mock("ethers", () => {
  return {
    Contract: jest.fn().mockImplementation(() => {
      return {
        isRegistered: mockIsRegistered,
      };
    }),
  };
});

const MOCK_ADDRESS = "0x738488886dd94725864ae38252a90be1ab7609c7";

describe("Attempt verification", function () {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return true for an address whitelisted with gooddollar", async () => {
    mockIsRegistered.mockResolvedValueOnce(true);
    const gd = new GoodDollarProvider();
    const verifiedPayload = await gd.verify({
      address: MOCK_ADDRESS,
    } as RequestPayload);

    expect(mockIsRegistered).toBeCalledWith(MOCK_ADDRESS);
    expect(verifiedPayload).toEqual({
      valid: true,
      record: {
        address: MOCK_ADDRESS,
      },
    });
  });

  it("should return false for an address that is not whitelisted with gooddollar", async () => {
    mockIsRegistered.mockResolvedValueOnce(false);
    const UNREGISTERED_ADDRESS = "0xUNREGISTERED";

    const gd = new GoodDollarProvider();
    const verifiedPayload = await gd.verify({
      address: UNREGISTERED_ADDRESS,
    } as RequestPayload);

    expect(mockIsRegistered).toBeCalledWith(UNREGISTERED_ADDRESS);
    expect(verifiedPayload).toEqual({
      valid: false,
    });
  });

  it("should return error response when isWhitelisted call errors", async () => {
    mockIsRegistered.mockRejectedValueOnce("some error");
    const UNREGISTERED_ADDRESS = "0xUNREGISTERED";

    const gd = new GoodDollarProvider();
    const verifiedPayload = await gd.verify({
      address: UNREGISTERED_ADDRESS,
    } as RequestPayload);

    expect(mockIsRegistered).toBeCalledWith(UNREGISTERED_ADDRESS);
    expect(verifiedPayload).toEqual({
      valid: false,
      error: [JSON.stringify("some error")],
    });
  });
});
