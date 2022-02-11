/* eslint-disable one-var */
/* eslint-disable sort-keys */
/* eslint-disable sort-vars */
/* eslint-disable no-magic-numbers */
const NUMBER = {
  zero: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10
};

const milisecond = NUMBER.one,
  second = 1000 * milisecond,
  minute = 60 * second,
  hour = 60 * minute,
  day = 24 * hour,
  week = NUMBER.seven * day;

const TIME = {
  milisecond,
  second,
  minute,
  hour,
  day,
  week
};

const default_delete_days = NUMBER.seven,
  link_expiry_days = NUMBER.three;

const IDlen = {
  min: 17,
  max: 19
};

module.exports = {
  TIME,
  NUMBER,
  default_delete_days,
  link_expiry_days,
  IDlen
};
