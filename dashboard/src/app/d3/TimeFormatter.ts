import * as d3 from 'd3';

const f = d3.timeFormatLocale({
  dateTime: '%a %e %B %Y %T',
  date: '%d-%m-%Y',
  time: '%H:%M:%S',
  periods: ['AM', 'PM'],
  days: ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'],
  shortDays: ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'],
  months: ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'],
  shortMonths: ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec']
});

const formatMillisecond = f.format('.%L');
const formatSecond = f.format(':%S');
const formatMinute = f.format('%H:%M'); // default: %I:%M
const formatHour = f.format('%H:%M'); // default: %I %p
const formatDay = f.format('%a %d %b');
const formatWeek = f.format('%a %d %b');
const formatMonth = f.format('%B');
const formatYear = f.format('%Y');

export function multiFormat (date: Date | d3.NumberValue) {
  if (typeof date === 'number') {
    date = new Date(date);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const d = date as any as Date;

  return (d3.timeSecond(d) < d
    ? formatMillisecond
    : d3.timeMinute(d) < d
      ? formatSecond
      : d3.timeHour(d) < d
        ? formatMinute
        : d3.timeDay(d) < d
          ? formatHour
          : d3.timeMonth(d) < d
            ? (d3.timeWeek(d) < d ? formatDay : formatWeek)
            : d3.timeYear(d) < d
              ? formatMonth
              : formatYear)(d);
}
