
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
