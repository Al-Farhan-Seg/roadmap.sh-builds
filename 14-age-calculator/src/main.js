import datepicker from 'js-datepicker';
import 'js-datepicker/dist/datepicker.min.css';
import { DateTime } from 'luxon';
import './style.css';
import faviconUrl from '../../top_assets/favicon-F.png';

const favicon = document.createElement('link');
favicon.rel = 'icon';
favicon.type = 'image/png';
favicon.href = faviconUrl;
document.head.appendChild(favicon);

const birthdateInput = document.getElementById('birthdate');
const result = document.getElementById('result');

datepicker(birthdateInput, {
  maxDate: new Date(),
  formatter: (input, date) => {
    input.value = DateTime.fromJSDate(date).toFormat('yyyy-LL-dd');
  },
  onSelect: (instance, date) => {
    if (!date) {
      result.textContent = '';
      return;
    }

    const { years, months, days } = DateTime.now()
      .diff(DateTime.fromJSDate(date), ['years', 'months', 'days'])
      .toObject();

    result.textContent = `You are ${years} years, ${months} months, and ${Math.floor(days)} days old.`;
  },
});
