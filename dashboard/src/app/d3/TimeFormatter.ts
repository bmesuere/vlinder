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
const formatDay = f.format('%a %d');
const formatWeek = f.format('%a %d %b');
const formatMonth = f.format('%B');
const formatYear = f.format('%Y');

export function multiFormat (date: Date) {
  return (d3.timeSecond(date) < date ? formatMillisecond
    : d3.timeMinute(date) < date ? formatSecond
      : d3.timeHour(date) < date ? formatMinute
        : d3.timeDay(date) < date ? formatHour
          : d3.timeMonth(date) < date ? (d3.timeWeek(date) < date ? formatDay : formatWeek)
            : d3.timeYear(date) < date ? formatMonth
              : formatYear)(date);
}
