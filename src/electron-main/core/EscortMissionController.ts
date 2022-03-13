export class EscortMissionController {
  private position = 0;

  constructor() {
    this.initlize();
    this.registerListener();
  }

  initlize() {}

  move(position: number) {
    if (!this.canMove(position)) return;
  }

  canMove(position: number) {
    /**
     * 0    1   2   3
     * 4    5   6   7
     * 8    9  10  11
     * 12  13  14  15
     */

    return position - 1 > 0;
  }

  sendMove() {}

  getPosition() {
    return this.position;
  }

  registerListener() {}
}
