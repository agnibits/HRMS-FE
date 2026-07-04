import { useState } from 'react';
import dayjs from 'dayjs';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import cn from '@/utils/cn';
import { IconButton } from './Button';

/**
 * Month calendar with event markers.
 * events: [{ date: 'YYYY-MM-DD' | ISO, label, color? }]
 */
export function Calendar({ events = [], onSelectDate, className }) {
  const [month, setMonth] = useState(dayjs().startOf('month'));
  const [selected, setSelected] = useState(null);

  const start = month.startOf('week');
  const days = Array.from({ length: 42 }, (_, i) => start.add(i, 'day'));
  const eventsByDay = events.reduce((acc, e) => {
    const key = dayjs(e.date).format('YYYY-MM-DD');
    (acc[key] = acc[key] || []).push(e);
    return acc;
  }, {});

  const dotColors = {
    primary: 'bg-primary-500', green: 'bg-emerald-500', red: 'bg-red-500',
    amber: 'bg-amber-500', purple: 'bg-violet-500', blue: 'bg-sky-500',
  };

  return (
    <div className={cn('card', className)}>
      <div className="flex items-center justify-between border-b border-surface-200 px-4 py-3 dark:border-surface-800">
        <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100">
          {month.format('MMMM YYYY')}
        </h3>
        <div className="flex items-center gap-1">
          <IconButton icon={FiChevronLeft} label="Previous month" size="sm" onClick={() => setMonth(month.subtract(1, 'month'))} />
          <button
            className="rounded-lg px-2.5 py-1 text-xs font-medium text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-950"
            onClick={() => setMonth(dayjs().startOf('month'))}
          >
            Today
          </button>
          <IconButton icon={FiChevronRight} label="Next month" size="sm" onClick={() => setMonth(month.add(1, 'month'))} />
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-surface-100 text-center text-xs font-medium text-surface-400 dark:border-surface-800">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} className="py-2">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {days.map((day) => {
          const key = day.format('YYYY-MM-DD');
          const dayEvents = eventsByDay[key] || [];
          const isCurrentMonth = day.isSame(month, 'month');
          const isToday = day.isSame(dayjs(), 'day');
          const isSelected = selected === key;
          return (
            <button
              key={key}
              onClick={() => { setSelected(key); onSelectDate?.(key, dayEvents); }}
              className={cn(
                'flex min-h-16 flex-col items-center gap-1 border-b border-r border-surface-100 p-1.5 text-sm transition-colors last:border-r-0 dark:border-surface-800/60',
                !isCurrentMonth && 'text-surface-300 dark:text-surface-600',
                isSelected ? 'bg-primary-50 dark:bg-primary-950/40' : 'hover:bg-surface-50 dark:hover:bg-surface-850'
              )}
            >
              <span
                className={cn(
                  'flex size-6 items-center justify-center rounded-full',
                  isToday && 'bg-primary-600 font-semibold text-white'
                )}
              >
                {day.date()}
              </span>
              {dayEvents.length > 0 && (
                <span className="flex flex-wrap justify-center gap-0.5">
                  {dayEvents.slice(0, 3).map((e, i) => (
                    <span key={i} title={e.label} className={cn('size-1.5 rounded-full', dotColors[e.color] || dotColors.primary)} />
                  ))}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default Calendar;
