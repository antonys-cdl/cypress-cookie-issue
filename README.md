# cypress-cookie-issue

Because this test needed different hostnames to reproduce the behaviour we're seeing
in our actual website, this contains a small Express.js server to run the tests against
as well as the Cypress test case, and a Dockerfile to allow them to be run together.

 Simplest way to reproduce:
```
docker build -t cypress-cookie-issue .
docker run --rm -it --add-host="main-app:127.0.0.1" --add-host="secondary-app:127.0.0.1"  cypress-cookie-issue
```

## Option 2
You can also reproduce it by setting up entries for main-app and secondary-app
in your hosts file to point to localhost and start the webapp using
npm start, and cypress however you like.

## Expected results
The first test should pass, it's navigating on one domain,
the second will fail with a simple navigation to a second domain,
and the third will also fail but more closely matches our actual use
where we are setting cookies on both sites visited.  I only realised
it could be simplified further while preparing this example repo.

I believe all three should pass if the issue is resolved.
