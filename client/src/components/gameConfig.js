class Field {
    /**
     * @param {number} index
     * @param {number} x
     * @param {number} y
     * @param {number} sleep
     * @param {number} goesTo
     * @param {boolean} goesBothWays
     */
    constructor(index, x, y, sleep, goesTo = 0, goesBothWays = false) {
        this.index = index;
        this.x = x;
        this.y = y;
        this.goesTo = goesTo;
        this.sleep = sleep;
        this.goesBothWays = goesBothWays;
        /** @type {Player.id[]} */
        this.players = [];
    }
}

export const FIELDS = [
    new Field(0, 56, 98, 0),
    new Field(1, 94, 132, 0),
    new Field(2, 104, 190, 0),
    new Field(3, 107, 252, 0),
    new Field(4, 101, 313, 0),
    new Field(5, 76, 374, 0, 7),
    new Field(6, 57, 434, 0, 13),
    new Field(7, 65, 495, 0),
    new Field(8, 113, 536, 0, 10),
    new Field(9, 174, 545, 0),
    new Field(10, 234, 524, 0),
    new Field(11, 261, 465, 0, 9),
    new Field(12, 276, 406, 0),
    new Field(13, 256, 347, 0),
    new Field(14, 224, 294, 0, 7),
    new Field(15, 206, 235, 0),
    new Field(16, 206, 175, 0, 23),
    new Field(17, 226, 121, 0,),
    new Field(18, 267, 80, 0),
    new Field(19, 317, 52, 0),
    new Field(20, 376, 52, 0),
    new Field(21, 427, 80, 0),
    new Field(22, 452, 132, 0, 18),
    new Field(23, 431, 187, 0),
    new Field(24, 398, 236, 2),
    new Field(25, 371, 290, 0, 23),
    new Field(26, 355, 346, 0, 27),
    new Field(27, 351, 404, 0),
    new Field(28, 367, 462, 0),
    new Field(29, 396, 513, 0, 34, true),
    new Field(30, 453, 540, 0),
    new Field(31, 517, 534, 0),
    new Field(32, 572, 499, 0),
    new Field(33, 603, 445, 0),
    new Field(34, 603, 380, 0, 29, true),
    new Field(35, 578, 322, 0, 37),
    new Field(36, 560, 261, 0),
    new Field(37, 542, 200, 0),
    new Field(38, 542, 139, 0),
    new Field(39, 567, 82, 0, 36),
    new Field(40, 623, 55, 0),
    new Field(41, 685, 56, 0),
    new Field(42, 736, 98, 1),
    new Field(43, 757, 160, 0),
    new Field(44, 753, 225, 0, 41),
    new Field(45, 738, 284, 0),
    new Field(46, 707, 341, 0, 33),
    new Field(47, 686, 399, 0),
    new Field(48, 685, 461, 0, 45),
    new Field(49, 704, 519, 0, 47),
    new Field(50, 700, 580, 0),
];

export const FIELDS_CHUNKED = [];
let i, chunk = 9;
for (i = 0; i < FIELDS.length; i += chunk) {
  let tmp = FIELDS.slice(i, i + chunk);
  if (i / chunk % 2) tmp = tmp.reverse();
  FIELDS_CHUNKED.push(...tmp);
}
