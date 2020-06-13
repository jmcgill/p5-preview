function setup() {
  let d = 70;
  let p1 = d;
  let p2 = p1 + d;
  let p3 = p2 + d;
  let p4 = p3 + d;

  // Sets the screen to be 720 pixels wide and 400 pixels high
  setBackground(255);
  createCanvas(720, 400, HPGL);
  noSmooth();

  translate(140, 0);

  // Draw gray box
  stroke(153);
  line(p3, p3, p2, p3);
  line(p2, p3, p2, p2);
  line(p2, p2, p3, p2);
  line(p3, p2, p3, p3);
}
