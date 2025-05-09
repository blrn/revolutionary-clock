import p5 from "p5";
require("repubdate");

const width = 600;
const height = 600;
const smoothSeconds = false;

const clockOuterColor = "#DE617B";
const clockInnerColor = "#D43858";
const secHandColor = "#FFFFFF";
const minHandColor = "#FFFFFF";
const hourHandColor = "#FFFFFF";
const minorTickColor = "#FFFFFF";
const majorTickColor = "#FFFFFF";

const minorTickNum = 100;
const majorTickNum = 10;

const secStrokeWeight = 1;
const minStrokeWeight = 2;
const hourStrokeWeight = 3;
const minorTickWeight = 4;
const majorTickWeight = 5;

const CLOCK_DIA_RATIO = 1.7;
const CLOCK_OUT_DIA_RATIO = 1.8;
const SEC_RAD_RATIO = 0.7;
const MIN_RAD_RATIO = 0.6;
const HOUR_RAD_RATIO = 0.4;
const TICK_RAD_RATIO = 0.8;
const MINOR_TICK_LEN_RATIO = 0.05;
const MAJOR_TICK_LEN_RATIO = 0.1;
const TIME_TEXT_SIZE_RATIO = 0.1;
const DATE_TEXT_SIZE_RATIO = 0.1;

const clockCenterX = width / 2;
const clockCenterY = height / 2;

const stdSecondsPerDay = 3600 * 24;
const metricSecondsPerMinute = 100;
const metricMinutesPerHour = 100;
const metricHoursPerDay = 10;
const metricSecondsPerHour = metricSecondsPerMinute * metricMinutesPerHour;
const metricSecondsPerDay = metricSecondsPerHour * metricHoursPerDay;

let cTime = new Date();

let clockDiameter;
let clockRadius;

class MetricTime {
  constructor(hours, minutes, seconds, stdDate) {
    this.hours = hours;
    this.minutes = minutes;
    this.seconds = seconds;
    this.stdDate = stdDate;
  }

  static fromRegularTime(stdDate) {
    const stdHour = stdDate.getHours();
    const stdMin = stdDate.getMinutes();
    const stdSec = stdDate.getSeconds() + stdDate.getMilliseconds() / 1000;
    const totalStdSeconds = stdHour * 3600 + stdMin * 60 + stdSec;
    const totalSeconds =
      (totalStdSeconds / stdSecondsPerDay) * metricSecondsPerDay;
    // print(`totalStdSeconds=${totalStdSeconds}`);
    // print(`totalSeconds=${totalSeconds}`);
    const h = totalSeconds / metricSecondsPerHour;
    let remSeconds = totalSeconds - Math.floor(h) * metricSecondsPerHour;
    const m = remSeconds / metricSecondsPerMinute;
    remSeconds -= Math.floor(m) * metricSecondsPerMinute;
    // const s = round(remSeconds);
    const s = remSeconds;
    // print(`h=${h} m=${m} s=${s}`);
    return new MetricTime(h, m, s, stdDate);
  }
}

new p5((p) => {
  p.setup = () => {
    p.createCanvas(width, height);
    // frameRate(4);

    clockDiameter = Math.min(width, height);
    clockRadius = clockDiameter / 2;
  };

  p.draw = () => {
    p.background(220);
    cTime = new Date();
    let mTime = MetricTime.fromRegularTime(cTime);
    drawClock(p, mTime);
  };

  function drawClock(p, mTime) {
    let secs = smoothSeconds ? mTime.seconds : Math.floor(mTime.seconds);
    let sAngle = p.map(secs, 0, 100, 0, 2 * Math.PI) - Math.PI;
    let mAngle = p.map(mTime.minutes, 0, 100, 0, 2 * Math.PI) - Math.PI;
    let hAngle = p.map(mTime.hours, 0, 10, 0, 2 * Math.PI) - Math.PI;
    p.push(); // push base
    p.ellipseMode(p.CENTER);
    p.fill(clockOuterColor);
    p.noStroke();
    p.translate(clockCenterX, clockCenterY);
    p.circle(0, 0, CLOCK_OUT_DIA_RATIO * clockRadius);
    p.fill(clockInnerColor);
    p.circle(0, 0, CLOCK_DIA_RATIO * clockRadius);
    drawClockHand(
      p,
      sAngle,
      SEC_RAD_RATIO * clockRadius,
      secStrokeWeight,
      secHandColor
    );
    drawClockHand(
      p,
      mAngle,
      MIN_RAD_RATIO * clockRadius,
      minStrokeWeight,
      minHandColor
    );
    drawClockHand(
      p,
      hAngle,
      HOUR_RAD_RATIO * clockRadius,
      hourStrokeWeight,
      hourHandColor
    );
    drawTicks(
      p,
      minorTickNum,
      MINOR_TICK_LEN_RATIO * clockRadius,
      minorTickWeight,
      minorTickColor
    );
    drawTicks(
      p,
      majorTickNum,
      MAJOR_TICK_LEN_RATIO * clockRadius,
      majorTickWeight,
      majorTickColor
    );

    p.push();
    p.fill("white");
    p.textAlign(p.CENTER);
    const timeTextSize = clockRadius * TIME_TEXT_SIZE_RATIO;
    const timeTextY = 30 + timeTextSize;
    const dateTextSize = clockRadius * DATE_TEXT_SIZE_RATIO;
    const dateTextY = timeTextY + dateTextSize + 10;
    p.textSize(timeTextSize);
    const hStr = String(Math.floor(mTime.hours)).padStart(2, "0");
    const mStr = String(Math.floor(mTime.minutes)).padStart(2, "0");
    const secStr = String(smoothSeconds ? secs.toFixed(2) : secs).padStart(
      2,
      "0"
    );
    p.text(`${hStr}:${mStr}:${secStr}`, 0, timeTextY);
    p.textSize(dateTextSize);
    const dateText = mTime.stdDate.toRevolutionaryString();
    p.text(dateText, 0, dateTextY);
    // console.log(`dateText='${dateText}'`);
    // print(mTime.stdDate.toRevolutionaryString());
    p.pop();
    p.pop(); // pop base
  }

  function drawClockHand(p, angle, length, strokeW, strokeColor) {
    p.push();
    p.noFill();
    p.strokeWeight(strokeW);
    p.stroke(strokeColor);
    p.rotate(angle);
    p.line(0, -20, 0, length);
    p.pop();
  }

  function drawTicks(p, num, length, strokeW, strokeColor) {
    const dAngle = (2 * Math.PI) / num;
    p.push();
    p.noFill();
    p.strokeWeight(strokeW);
    p.stroke(strokeColor);
    const outerPoint = TICK_RAD_RATIO * clockRadius;
    for (let i = 0; i < num; i++) {
      const a = dAngle * i;
      p.rotate(dAngle);
      p.line(0, outerPoint, 0, outerPoint - length);
      // line(outerPoint, 0, outerPoint-length, 0);
    }

    p.pop();
  }
});
