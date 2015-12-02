# ResetTimer
[ResetTimer](http://blog.prohakr.com/articles/resettimer/) is a microservice for a resetting countdown timer.  The timers are polled with at-most-once signalling when the timer expires.

The service is built on AWS Lambda, API Gateway, and DynamoDB using update expressions.  It's intended as a demonstration of DynamoDB atomic update triggers, but is available for use.   It's based on polling, so it's not always the best solution, but it can be useful in the right circumstance.


## Why?
Two reasons:  

1.  To experiment with Lambda update expressions
2.  To solve a specific problem -- coordinate a set of N app servers that are polling for a signal to execute a job by any one of the app servers.  Jobs run every N seconds.

See the [documentation](http://blog.prohakr.com/articles/resettimer/) for details on it's use.

