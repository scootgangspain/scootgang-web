
class ScootgangBluetoothSession {
  constructor() {
    this.phase = "disconnected";
    this.paired = false;
    this.device = null;
    this.initialKeyReceived = false;
this.recalcReceived = false;
this.confirmReceived = false;
this.sessionKey = null;
this.messageCounter = 0;

  }

  setPhase(phase) {
    this.phase = phase;
    console.log("SCOOTGANG sesión:", phase);
  }

  getStatus() {
    return {
      phase: this.phase,
      paired: this.paired
    };
  }

async deriveKey(dataA, dataB) {
  if (
    !(dataA instanceof Uint8Array) ||
    !(dataB instanceof Uint8Array) ||
    dataA.length !== 16 ||
    dataB.length !== 16
  ) {
    throw new Error("Las claves deben contener 16 bytes");
  }

  const combined = new Uint8Array(32);
  combined.set(dataA, 0);
  combined.set(dataB, 16);

  const hash = await crypto.subtle.digest(
    "SHA-1",
    combined
  );

  return new Uint8Array(hash).slice(0, 16);
}

async aesBlock(keyBytes, dataBytes) {
  if (
    !(keyBytes instanceof Uint8Array) ||
    !(dataBytes instanceof Uint8Array) ||
    keyBytes.length !== 16 ||
    dataBytes.length !== 16
  ) {
    throw new Error("AES requiere bloques de 16 bytes");
  }

  const key = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "AES-CBC" },
    false,
    ["encrypt"]
  );

  const encrypted = await crypto.subtle.encrypt(
    {
      name: "AES-CBC",
      iv: new Uint8Array(16)
    },
    key,
    dataBytes
  );

  return new Uint8Array(encrypted).slice(0, 16);
}

xorBlocks(blockA, blockB) {
  if (
    !(blockA instanceof Uint8Array) ||
    !(blockB instanceof Uint8Array) ||
    blockA.length !== 16 ||
    blockB.length !== 16
  ) {
    throw new Error("XOR requiere dos bloques de 16 bytes");
  }

  const result = new Uint8Array(16);

  for (let i = 0; i < 16; i++) {
    result[i] = blockA[i] ^ blockB[i];
  }

  return result;
}

parseFrame(bytes) {
  if (!(bytes instanceof Uint8Array)) {
    throw new Error("El paquete debe ser Uint8Array");
  }

  if (
    bytes.length < 7 ||
    bytes[0] !== 0x5A ||
    bytes[1] !== 0xA5
  ) {
    return null;
  }

  const length = bytes[2];

  if (bytes.length !== 7 + length) {
    return null;
  }

  return {
    src: bytes[3],
    dst: bytes[4],
    cmd: bytes[5],
    arg: bytes[6],
    data: bytes.slice(7)
  };
}


async createInitialKey(deviceName) {
  if (typeof deviceName !== "string" || !deviceName) {
    throw new Error("Nombre Bluetooth no válido");
  }

  const protocolKey = Uint8Array.of(
    151, 207, 184, 2,
    132, 65, 67, 222,
    86, 0, 43, 59,
    52, 120, 10, 93
  );

  const encodedName = new TextEncoder().encode(deviceName);
  const nameBytes = new Uint8Array(16);

  nameBytes.set(encodedName.slice(0, 16));

  return this.deriveKey(nameBytes, protocolKey);
}

async encryptInitialFrame(frame, deviceName) {
  if (
    !(frame instanceof Uint8Array) ||
    frame.length < 3 ||
    frame[0] !== 0x5A ||
    frame[1] !== 0xA5
  ) {
    throw new Error("Paquete inicial no válido");
  }

  const protocolKey = Uint8Array.of(
    151, 207, 184, 2, 132, 65, 67, 222,
    86, 0, 43, 59, 52, 120, 10, 93
  );

  const initialKey = await this.createInitialKey(deviceName);
  const mask = await this.aesBlock(initialKey, protocolKey);

  const payload = frame.slice(3);
  const encrypted = new Uint8Array(payload.length);

  
let checksum = 0;

for (const byte of frame) {
  checksum = (checksum + byte) & 0xFFFF;
}

checksum = (checksum ^ 0xFFFF) & 0xFFFF;

for (let i = 0; i < payload.length; i++) {
  encrypted[i] = payload[i] ^ mask[i % 16];
}


  const result = new Uint8Array(3 + encrypted.length + 6);

  result.set(frame.slice(0, 3), 0);
  result.set(encrypted, 3);

result[3 + encrypted.length] = checksum & 255;
result[3 + encrypted.length + 1] = (checksum >>> 8) & 255;

  return result;
}

buildInitialKeyRequest(deviceName) {
  if (typeof deviceName !== "string") {
    throw new Error("Nombre Bluetooth no válido");
  }

  const prefixes = ["1CG", "1K1", "1EF"];
  const compatible = prefixes.some(prefix =>
    deviceName.startsWith(prefix)
  );

  return Uint8Array.of(
    0x5A, 0xA5, 0x00,
    0x3E,
    compatible ? 1 : 0,
    0x5B,
    0x00
  );
}


async startPairing() {
  if (!this.device?.gatt?.connected) {
    throw new Error("El patinete no está conectado por Bluetooth");
  }

  this.paired = false;
  this.initialKeyReceived = false;
  this.recalcReceived = false;
  this.confirmReceived = false;
  this.messageCounter = 0;

  this.setPhase("pairing-initializing");

  console.log("SCOOTGANG: Preparando emparejamiento seguro");
}

  reset() {
    this.device = null;
    this.paired = false;
this.initialKeyReceived = false;
this.recalcReceived = false;
this.confirmReceived = false;
this.sessionKey = null;
this.messageCounter = 0;

    this.setPhase("disconnected");
  }
}

window.scootgangSession = new ScootgangBluetoothSession();
