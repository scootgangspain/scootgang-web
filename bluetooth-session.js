
class ScootgangBluetoothSession {
  constructor() {
    this.phase = "disconnected";
    this.paired = false;
    this.device = null;
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

  reset() {
    this.device = null;
    this.paired = false;
    this.setPhase("disconnected");
  }
}

window.scootgangSession = new ScootgangBluetoothSession();
