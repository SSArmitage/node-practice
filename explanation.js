/*
I used this file to explain my thought processes and document what I did at each step. I also use comments in the index.js file to explain what is going on with a particular line/block of code. Also I type out concepts to see if I understand what it means.

------------- WORK SAMPLE --------------

ENVIRONMENT SETUP:
- I cloned the repo, npm install, npm run dev, pointed to local host, and saw the home page
*based on the recieved files and googling, I installed the following:
- express, pg, and dotenv dependencies
- PostgreSQL
- Docker 
- PostgreSQL VS code extension (as an alternative way to view the result data)

*NOTE: I was not 100% sure of what I needed in the way of environment to proceed. It would be at this point that I would use my resources to find out (ask a senior dev, team lead, etc)
I would also in my spare time take a course on these subjects, i.e. a Udemy course on node.js, express, PostgreSQL

INITIAL OBSERVATION:
- first I wanted to see the output from the app.get() requests for each of the endpoints
- I opened it up in the browser, but I also used an API simulator to hit the API (used POSTMAN) -> http://localhost:5432/
- apart from viewing the homepage ('/') I was not sure how to request the other routes. Based on routing I did in React, my initial instinct was to tag on the additional '/events/hourly' as an endpoint in the browser. But this did not work.
- I feel like I was missing some key piece, because I tried playing around with the code in index.js, and the SQL shell, and the Docker cli and gui. On a side note, I will definitely be taking some kind of course on this becasue I NEED to know why!?!?
- I ended up installing the PostgreSQL VS code extension
- I was able to see the request results using this extension
    -> I created a .sql file, put the query in there, and viola! 

PROBLEMS/SOLUTIONS:
1. server-side rate-limiting
-Rate limiting refers to preventing the frequency of an operation from exceeding some constraint. In large-scale systems, rate limiting is commonly used to protect underlying services and resources
-To enforce rate limiting, first understand why it is being applied in the particular case (i.e. security, making API scalable), and then determine which attributes of the request are best suited to be used as the limiting key (for example, source IP address, user, API key)

Different approaches to rate-limiting:
* I read through a lot of content, and most suggested using the following:

1. Reservoir Intervals:
a) Increse Interval / Token Bucket -> add a counter (represents the bucket or resevoir) that keeps track of how many "tokens" a user has (each token represents a request), and a time stamp to keep track of the passage of time. The user starts out with a specific number of alloted tokens (counter is initialized to a number). Each time the user makes a request, they use up a token and the counter decrements. But at the same time, tokens are added to the counter at a regular interval. This ensures that the user will never actually run out of tokens. If the user makes a bunch of requests and uses up all their tokens they can not make any requests until the bucket recieves an additional token, and at that point, they will have to continue waiting the interval duration after each request. Also, the counter would have a maximum amount. This ensures that if the user doesnt make any requests for a while the counter doesnt continuously increment.
    * Can use a reverse proxy to rate limit
    -> reverse proxy can also use the token bucket approach
    -> the reverse proxy will sit between the server and the client facing the client. It accepts requests from the client and passes them on to the server
    -> Rate limiting occurs early in the reverse proxy processing of a request. Before authentication, authorization, http transformations, and the backend being called
    -> Although this application is running in Development environment, if it were in Production... From the Express Docs: "Handing over tasks that do not require knowledge of application state to a reverse proxy frees up Express to perform specialized application tasks. For this reason, it is recommended to run Express behind a reverse proxy like Nginx or HAProxy in production."

b) Refresh Interval -> the counter represents a resevoir that has an alloted amount of jobs it can execute. Its similar to the approach above, except that after the specific interval time, the whole resevoir is replenished with its total number of jobs.
* also use minTime and/or maxConcurrent to spread out the load, so that when the resevoir is replenished with the set amount of jobs, not all the qued jobs fire at the same time.

2. Bounce Rate:
    -> a “bounce” occurs when someone visits your website and leaves without interacting further with your site.
    -> I came accross this concept of bounce rate, and I didn't find anything that said it could be used for rate-limiting, but it seemed like an additional approach? I'm just curious if it can be harnessed to control requets in any way?

HOW TO:
- a middleware can be used to rate-limit the api endpoints
- it can be added after the path and before the route callback. The route callback will be called if the rate limit is not reach.
- i.e. app.get('/events/daily', rateLimitMiddleware, handler)
- the rate limited should have two things:
- If it’s the first request then store the client request count somewhere and allow the request.
- If it’s a recurring request then check the request count and time difference and allow/disallow the request.














*I would love some feedback, so I can know if I was on the right track

*/