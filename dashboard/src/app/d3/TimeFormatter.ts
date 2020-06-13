import * as d3 from 'd3';

const formatMillisecond = d3.timeFormat('.%L');
const formatSecond = d3.timeFormat(':%S');
const formatMinute = d3.timeFormat('%H:%M'); // default: %I:%M
const formatHour = d3.timeFormat('%H:%M'); // default: %I %p
const formatDay = d3.timeFormat('%a %d');
const formatWeek = d3.timeFormat('%b %d');
const formatMonth = d3.timeFormat('%B');
const formatYear = d3.timeFormat('%Y');

export function multiFormat (date: Date) {
  return (d3.timeSecond(date) < date ? formatMillisecond
    : d3.timeMinute(date) < date ? formatSecond
      : d3.timeHour(date) < date ? formatMinute
        : d3.timeDay(date) < date ? formatHour
          : d3.timeMonth(date) < date ? (d3.timeWeek(date) < date ? formatDay : formatWeek)
            : d3.timeYear(date) < date ? formatMonth
              : formatYear)(date);
}
