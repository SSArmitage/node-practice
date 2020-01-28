SELECT date, SUM(impressions) AS impressions,
             SUM(clicks) AS clicks,
             SUM(revenue) AS revenue
FROM public.hourly_stats
GROUP BY date
ORDER BY date
LIMIT 7;