SELECT date, hour,
             impressions,
             clicks,
             revenue
FROM public.hourly_stats
ORDER BY date, hour
LIMIT 168;