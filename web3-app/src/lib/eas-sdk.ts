export type SchemaEntry = {
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
  type: string;
};

export type EncodedSchemaData = SchemaEntry[];

export class SchemaEncoder {
  private readonly schema: string;

  constructor(schema: string) {
    if (!schema.trim()) {
      throw new Error("SchemaEncoder requires a non-empty schema definition");
    }
    this.schema = schema;
  }

  encodeData(data: SchemaEntry[]): EncodedSchemaData {
    if (!Array.isArray(data)) {
      throw new Error("SchemaEncoder.encodeData expects an array of schema entries");
    }
    return data.map((entry) => {
      if (!entry.name || !entry.type) {
        throw new Error("Schema entry must include a name and type");
      }
      return entry;
    });
  }
}

type AttestationRequest = {
  schema: string;
  data: {
    recipient: string;
    data: EncodedSchemaData;
    revocable: boolean;
  };
};

const DEFAULT_ATTESTATION_PREFIX = "0x";
const ATTESTATION_ID_HEX_LENGTH = 64;

function generateMockAttestationId(): string {
  const randomHex = Array.from({ length: ATTESTATION_ID_HEX_LENGTH }, () => {
    const value = Math.floor(Math.random() * 16);
    return value.toString(16);
  }).join("");
  return `${DEFAULT_ATTESTATION_PREFIX}${randomHex}`;
}

export class EAS {
  private readonly contractAddress: string;
  private connectedClient: unknown | null = null;

  constructor(contractAddress: string) {
    if (!contractAddress) {
      throw new Error("EAS contract address is required");
    }
    this.contractAddress = contractAddress;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  connect(client: any) {
    if (!client) {
      throw new Error("EAS.connect requires a wallet client instance");
    }
    this.connectedClient = client;
  }

  async attest(request: AttestationRequest) {
    if (!this.connectedClient) {
      throw new Error("EAS client is not connected");
    }
    if (!request.schema) {
      throw new Error("Attestation request must include a schema identifier");
    }
    if (!request.data?.recipient) {
      throw new Error("Attestation request must include a recipient");
    }

    const attestationId = generateMockAttestationId();

    return {
      wait: async () => attestationId,
    };
  }
}

export default {
  EAS,
  SchemaEncoder,
};
