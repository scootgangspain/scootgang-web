
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
