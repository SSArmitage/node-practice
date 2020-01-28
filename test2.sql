SELECT date, SUM(events) AS events
FROM public.hourly_events
GROUP BY date
ORDER BY date
LIMIT 7;