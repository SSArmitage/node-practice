SELECT date, hour,
             events
FROM public.hourly_events
ORDER BY date, hour
LIMIT 168;