// An abstraction of console functions
// Useful for testing and controlling global output
class Logger {
  private debug: boolean;

  public constructor() {
    this.setDebug(true);
  }

  public setDebug(quiet: boolean): void {
    this.debug = !quiet;
  }

  public log(...args: any[]): void {
    this.debug && console.log(...args);
  }

  public warn(...args: any[]): void {
    this.debug && console.warn(...args);
  }

  public error(...args: any[]): void {
    this.debug && console.error(...args);
  }
}

export default new Logger();
