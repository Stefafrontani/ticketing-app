# Ticketing App

## Description

### Functionality

This app will be used to enable users to sell and but tickets for different events.
The features it will have are:

- Users can list a ticket for an event for sale.
- Others users can purchase that tickets.
- Any user can list tickets for sale and purchase tickets.
- When a user attemps to purchase a ticket, the ticket is "locked" for 15 minutes. At that moment, the user has that amount of time to purchase the ticket.
- While locked, no other user can purchased the ticket. After 15 minutes, the ticket should unlock.
- Ticket prices can be edited if they are not locked.

### Resource types

User : Object = {
email : string,
password : string
}
Ticket : Object = {
title : string,
price : number,
userId : Reference User
orderId : Reference Order
}
Order : Object = {
userId : Reference User,
status : Created | Cancelled | AwaitingPayment | Completed,
ticketId : Reference Ticket,
expiresAt : Data
}
Charge : Object = {
orderId : Reference Order,
status : Created | Failed | Completed,
amount : number,
stripeId : string,
stripeRefundId : string
}

### Service types

Auth: Everything related to the signup, signin, signout.
Ticket: Ticket creation, editing. Knows everything about the ticket, whether it can be edited, etc.
Orders: Order creation, editing.
Expiration: Watches for orders to be created. Cancelled them after 15 minutes.
Payments: Handle credit card payments. Cancels orders if payments fails, complete if payment succeeds

### Events and architecture design

Events:
User related -> USerCreated UserUpdated
Ticket related -> TicketCreated TicketUpdated
Order related -> OrderCreated OrderCancelled OrderExpired
Charge related -> ChargeCreated

Architecture
\_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ _
| | | AUTH | | |
| | |_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ _ | | |
| | | _ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ _ | | |
| |<--------| | NODE |-->| MONGODB | |-------->| |
| | | |_ \_ \_ \_ \_ _ | |_ \_ \_ \_ \_ _ | | | |
| | |_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ _ | | |
| | | |
| | _ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ _ | |
| | | TICKETS | | |
| | |_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ _ | | |
| | | _ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ _ | | |
| |<--------| | NODE |-->| MONGODB | |-------->| |
| | | |_ \_ \_ \_ \_ _ | |_ \_ \_ \_ \_ _ | | | |
| | |_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ _ | | |
| | | |
| | _ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ _ | |
_ \_ \_ \_ \_ \_ _ | COMMON | | ORDERS | | NATS |
| Client | | | |_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ _ | | STREAMING |
| _ \_ \_ _ | | (MODULE | | _ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ _ | | SERVER |
| | NextJS | | | MENTION ABOVE) |<--------| | NODE |-->| MONGODB | |-------->| (event bus with |
| |_ \_ \_ _ | | | USED AMONG | | |_ \_ \_ \_ \_ _ | |_ \_ \_ \_ \_ _ | | | !== implementation) |
|_ \_ \_ \_ \_ \_ _ | | ALL SERVICES | |_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ _ | | |
| | | |
| | _ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ _ | |
| | | PAYMENTS | | |
| | |_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ _ | | |
| | | _ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ _ | | |
| |<--------| | NODE |-->| MONGODB | |-------->| |
| | | |_ \_ \_ \_ \_ _ | |_ \_ \_ \_ \_ _ | | | |
| | |_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ _ | | |
| | | |
| | _ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ _ | |
| | | EXPIRATION | | |
| | |_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ _ | | |
| | | _ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ _ | | |
| |<--------| | NODE |-->| Redis! | |-------->| |
| | | |_ \_ \_ \_ \_ _ | |_ \_ \_ \_ \_ \_ _ | | | |
| _ \_ \_ \_ \_ \_ \_ \_ \_ _ | |_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ \_ _ | |_ \_ \_ \_ \_ \_ \_ \_ \_ \_ |

## Project tips

### Ingress NGINX

Remember that ingress nginx is an API object that manages external access to the services in a cluster, typically HTTP.
Ingress exposes HTTP and HTTPS routes from outside the cluster to services within the cluster. Traffic routing is controlled by rules defined on the Ingress resource.

Basically it allows us to access services inside our cluster from outside it.

We have a service that responds somthing in a route.
To have access to one service inside aour cluster we can have a nodePort services or we can set up an ingress service. Any time a request comes into our cluster, will be handle by that ingress service and will be routed up to the correct service.

Besides configuring a ingress-srv.yaml file, we have to trick the pc in order that whenever we want to access spec.rules[0].host (ticketing.dev in this example), in reality it will be accessing localhost.
The path on windows is
\$ cd `C:\Windows\System32\drivers\etc`
\$ code hosts // opens the hostsfile: in there, we have to write
`127.0.0.1 ticketing.dev`. This will get us access to url

When trying to access ticketing.dev/api/users/currentuser we can see a `Your connection is not private`.
NGINX is a web server that will use an HTTPS connection. Unfortunately by default, it will use a self sign certificate and chrome does not trust those servers that use that type of servers

That webserver will use a config to disable a way to avoid that `Your conenction is not private` problem. The solution: type `thisisunsafe` whenever while on the ticket.dev url.

### Leveraging a cloud environment for develop

1. Make an account in `console.cloud.google`
2. Go to `kubernetes engine`
3. Click `Create cluster`
4. Change the default config:
   . cluster name
   . location type (zonal)
   . kubernetes version (1.15 minumun used in course)
   . default pool
   . nodes ( Quantity - 3 AND Machine type : g1-small (1.7 gb))

By default, when we run `kubectl`, it uses somehting called context.
This context could be think of different connecitons settings. authroizations credentials, api adresses, etc. It tells kubectl how to connect to our local cluster - This is its default behaviour

We should add another context to tell kubectl to conenct to google cloud cluster

A way to configure different cluster for klusterctl is to use google cloud SDK in our macchine. It will manage this diffrent context for kubernetes.
After installing it run
`$ gcloud auth login` // You should login with the same account of the project created in google cloud developer
`$ gloud init` // promt to use 2 configuration: Re-initialize with some default(1) or create new config (2). Select 1
Add account used to login before
Select project. Select from list
Configure default Compute Region and Zone (we selected one zone when creating the google cloud cluster). Select from list

We have to decide whether if we want to run or no docker locally still
NO ?

1. Close docker desktop
2. run `$ gcloud components install kubectl`
3. run `$ gcloud container clusters get-credentials {clusterName}`

YES ? (more probable)

1. run `$ gcloud container clusters get-credentials {clusterName}`

The clusterName is the one on the google cloud

TO see if it works, you can go to docker icon, deploy the kubernetes preference and you should see 2 context - desktop-docker and weird-name-cluster-google-cloud

After all this, we should update skaffold config to enable build process inside google cloud build - when an unsync change is made (out of src/\*_/_.js - sync property). So we have to

1. Enable google cloud build
2. Update the skaffold.yaml to use google cloud build
   build:
   <!--    local:
      push: false -->
   googleCloudBuild:
   projectId: pacific-destiny-whatever-id-googlecloud-gave-to-oyr-project
   ...
   artifacts: - image: us.gcr.io/projectId/auth // specify the image name that gcloud will give: its structure >-
   Then in auth-srv.yaml modify image from stefanofrontani/auth to us.gcr.io/projectId/auth
3. setup ingress-nginx on our google cloud cluster kubernetes.github.io/ingress-nginx
   Select from kubernetes menu in docker for desktop to the cluster on the google cloud
   Apply the mandatory command for NGINX and 1 additional command GCE GKE
4. Update our hosts file again to point to the remote cluster - no more localmachine
   Like before, we trick localhost with ticketing.dev, now we have to write the ip address of the load balancer that google cloud creted for us. In google cloud developer - networking - network services - watch the load balancer. Click there and you will be redirect to that load balancer page with its characteristics
   Open hosts file and instead of 127.0.0.1 ticketing.dev, you should do ip-in-googlecloud ticketing.dev
5. Restart skaffold

## Errors

### express-validator

Validates with a specific-library syntax what we tell it to validate and attach errors in the request, where validationResult() will take the errors from

### Problem in microservices apps

In a multi-microservices app, every service can be build with a specific language - ROR, Java Spring, Express + express-validator -. Because of this, the errors each services might send in the response might be VERY different.
This is a huge problem on the client side because it will need to know how to process every type of error
Errors:

- Express: { msg: string; paran: string }
- ROR: { status: number; message: string }
- etc

We need to send always the SAME type of response. Always. Unify all those errors repsonses.

### Error handling - The solution

We must have a consistently structured response from all servers, no matter what went wrong.
-> Write an error handling middleware to process errors, give them a consistent structure, and send back to the browser

A billion things can go wrong, not just validation of inputs to a request handler. Each of these need to be handled consistently
-> Make sure we capture all possible erros using Express's erros handling mechanism (call the 'next' function!)

Middlewares in express

Each time we pass a middlewre to express
errorHandler (path: auth/middlewares/error-handler.ts ) in this case

```
app.use(errorHandler)
const errorHandler = (error, req, res, next) => {  }

```

Express will parse that funciton and count the amount of args it receives.
Whenever we pass 4 args, express assumes that that same function is in charge of handling errors. This is the reason why when an error occur, this function gets called - this is made by express.
Errors can occure in sync code or async code.

From doc: https://expressjs.com/en/guide/error-handling.html

Sync code

```
Throwing an error inside a route, will get that error handler middleware function to be called
app.get('/', function (req, res) {
  throw new Error('BROKEN') // Express will catch this on its own.
})
```

Async code
In case we have async code, we should call next - the middleware function by yourself i.e.:

```
app.get('/', function (req, res, next) {
  fs.readFile('/file-does-not-exist', function (err, data) {
    if (err) {
      next(err) // Pass errors to Express.
    } else {
      res.send(data)
    }
  })
})
```

All this is to centralize the error creating process and generate errors with the same strucuture, nomatter where the error was thrown and what thrown that error - a db connection, a validation in the req.body, etc.

Inside that middleware errorHandler, we have to define the structure of the error we are going to send.
The structure define for this project is this:

```
{
   errors: [
      {
         message: string,
         field: string
      }
   ]
}
```

In order to do this, we would add to the Error build-in object, some field like reasons:

```
const error = new Error('String that defines type of error')
error.reasons = { errors: [{  }] } // TS will complain that .reasons does not exist in Error object.
```

But we can not do this in typescript, we should create some errors based on the Error itself in order to add some properties to it, usefull to add information we like and standarize the structure off ALL erros inside our app
Those errors are in:
./errors/request-validaton-error.ts
./errors/database-connection-error.ts

These errors defines extra properties of their own:
errors: ValidationError[]
reason: string; // Hardcoded to 'Error connecting to a database'

Both errors should have methods that will be used to normalize the structure of those errors: will receive whatever properties needed and create the structure mentioned several times now:
{ errors: [ { ... } ] }
This is done so the errorHandler function does not know any of each specific Error structure, and only call that serializeErrors. Besides a status code is deifne each error.

We then use TS to check if the strcture return by serializeError is correct and that every Error use in errorHandler (RequestValidation or DatabseConnection) are always returning the status code as well.
This is done by:

Option #1

```
interface CustomError { statusCode: number; serializeErrors(): { message: string; field?: string }[] }
```

And in each error, implement that interface:

```
class RequestValidationError extends Error implements CustomError {}
```

Option #2
In order to simplify the if statementes inside the error hanlder

```
  if (err instanceof RequestValidationError) {
    return res.status(err.statusCode).send({ errors: err.serializeErrors() });
  }
  if (err instanceof DatabaseConnectionError) {
    return res.status(err.statusCode).send({ errors: err.serializeErrors() });
  }
```

We are going to have an abstract Class call CustomError abstract Class
Abstract Class:

- Can not be instantiated
- Used to set up requirements for subclasses
- Do create a Class when translated to JS!!! interfaace do not creat enothing when compile to plain JS. And because of this we can use instanceof checks!

We then create that CustomError abstract class to rely on that the structure of the errors among all the application will be consistent

Instead of asking, in error handler, for every Error : if err isntance off CustomError2, if err instance of CustomError2, we only ask if that err is an isntance off the generic CustomError

Async code - cathing errors

When we have async code, we can not throw an errors and expect express to catch it.

```
app.all('*', async (req, res) => {
   throw new NotFoundError()); // Way of catching (\*sync error)
});
```

That code above is never going to be catch by express. Instead we should use the next function express provide in the callback function and send the NotFoundError as an argument.

In code:

```
app.all('*', async (req, res, next) => {
   next(new NotFoundError()));
});
```

In order to mantain the first way of sending errors, we use the library express-async-errors in order to make express to be able to manage the async errors with the syntax above (\*sync error)
