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

const millisecond = NUMBER.one,
  second = 1000 * millisecond,
  minute = 60 * second,
  hour = 60 * minute,
  day = 24 * hour,
  week = NUMBER.seven * day;

const TIME = {
  millisecond,
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

const simpleIDMax = 1000;
const advIDMax = 350;

const EMBCOLORS = {
  hammerHandle: '#e1870a',
  error: '#ff0033',
  whiteGray: '#d8d4d3',
  wrenchHandle: '#84929f',
  invisible: '#2f3036',
  freeze: '#65919d'
};

module.exports = {
  advIDMax,
  TIME,
  NUMBER,
  simpleIDMax,
  default_delete_days,
  link_expiry_days,
  IDlen,
  EMBCOLORS
};
