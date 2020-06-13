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

const formatMillisecond = f.utcFormat('.%L');
const formatSecond = f.utcFormat(':%S');
const formatMinute = f.utcFormat('%H:%M'); // default: %I:%M
const formatHour = f.utcFormat('%H:%M'); // default: %I %p
const formatDay = f.utcFormat('%a %d');
const formatWeek = f.utcFormat('%b %d');
const formatMonth = f.utcFormat('%B');
const formatYear = f.utcFormat('%Y');

export function multiFormat (date: Date) {
  return (d3.utcSecond(date) < date ? formatMillisecond
    : d3.utcMinute(date) < date ? formatSecond
      : d3.utcHour(date) < date ? formatMinute
        : d3.utcDay(date) < date ? formatHour
          : d3.utcMonth(date) < date ? (d3.utcWeek(date) < date ? formatDay : formatWeek)
            : d3.utcYear(date) < date ? formatMonth
              : formatYear)(date);
}
