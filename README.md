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

## Reminder - auth-mongo-depl.yaml

MongoDB is just like any other thing that we want to run inside our kubernetes cluster.
We are going to be running mongoDB inside of a pod. We usually do not create pod directly, we use deployment, which will create pods for us. And to communicate to this mongoDB instance pod, we will have a clusterIP service as well.

// Deployment

apiVersion: apps/v1
kind: Deployment
metadata:
name: auth-mongo-depl
---spec:
---replicas: 1
---selector:
------matchLabels:
---------app: auth-mongo
---template:
------metadata: // How the deplyoment finds the pods that it actually creates
---------labels:
------------app: auth-mongo
---spec: // This is a label that gets apply to the pod
------containers:
---------\- name: auth-mongo
--------- image: mongo

---

apiVersion: v1
kind: Service
metadata:
---name: auth-mongo-srv
spec:
---selector: // Tell the service which pod is is going to govern access to - Match the one above
------app: auth-mongo
---ports:
------- name: db
---------protocol: TCP
---------port: 27017
---------targetPort: 27017

## Mongoose

2 important things over here

1. Mongoose User Model
   Represents the entire collection of the data collection (Users collection, for example)
2. Mongoose User Document
   Each piece of the collection - called a document (1 doc == 1 user, for example)

### Issues with typescript

1. Creating a new Document
   Given the shape: new User({ email: 'test@test.com', password: 'passTest' })
   Whenever we pass properties, TS wants to understand props passing in and make sure we are sending the correct types of data. Check the arguments pass to the funcion of User.
   Mongoose does not allow this to TS. TS will nos get errors of typo and, for isntance, we can send passeod instead of password and TS will not notice this
2. After we create a user, then we log a user and see that that user has more properties that we passed in before:
   Given the shape: new User({ email: 'test@test.com', password: 'passTest' })
   console.log(user) // Output { email, password, createdAt, updatedAt }

### Solutions to mongoose-TS compatibility issues

The goal is to have method inside our User model that allows as o build a user like:
User.build()
The problem is that TS does not recognize a build() method inside our model. For this, we create another interface called UserModel, which extends from the mongoose model type

```
// The any is for TS not to complain
interface UserModel extends mongoose.Model<any> {
   build: (attrs: UserAttrs) => any;
}
```

We then create an interface defining what props should accept our User model build function

```
interface UserAttrs {
   email: string;
   password: string;
}
```

In the end, when we create the user Model, we do it giving the UserModel as an TS argument type to mongoose.model.
The any type in there is for TS not to complain

```
const User = mongoose.model<any, UserModel>("User", userSchema);
```

### Angle brackets - (141)

Functions for types. Long story short.
In JS with pass arguments to a function in order to get some behaviour.
In TS, some types could receive type arguments to create a specific type

```
./users.ts
const User = mongoose.model<UserDoc, UserModel>("User", userSchema);
```

The above line can be inspect more in depth if we go to the ts definition of model:

```
export function model<T extends Document, U extends Model<T>>(
   name: string,
   schema?: Schema,
   collection?: string,
   skipInit?: boolean
): U;
```

That U is the UserModel, so the Model function will return a UserModel type value

## Password hashing-encryption

### Why?

In case some maliscious person get access to our DB collection and reads password and email as plain text.
Steps: Signup

1. Hash the password for the password used by the user.
2. Take that hash and send to DB

If anyone access our databse it would not be as bad as if they read passwords.

Steps: Signin

1. Hash password passed
2. Find user in DB
3. Coompare hash password stored in that user document with the password hashed provided by the user.
4. Give / Deny access

### scrypt

Awesome for encryption, party of node as module called 'crypto'.
It's callback based. Here enters promisify. Enables us to create promised-bsaed code, which get on well with async await we are using.

For hashing:
In reality, the hashed password is the part before the salt. The stored password consists of 2-parts
hashedPassword.salt

The salt is a random string attached to a hashed password that protects that hased password from a Rainbow Table Attack
In this way, we end up having a unique hashed password for every user: while the process of hashing the password is the same for every user, with the unique salt part attached to that hashed password makes the password-encryption process unique for each password

## Authentication Strategies and Options

The issues about authentication in microservices world is that almost every service should know whether a user is signin and has a valid session.

The approaches:

Fundamental solution #1

Make a sync request between services - the one that need the user validation authenticated and the auth service.

The props:

- Change to auth service are inmediately reflected
  The cons:
- Dependencies between services. If auth service go down, the entire app starts to be useless

Fundamental solution #2

Each service know how to authenticate a user

The pros:

- No dependencies between services.
  The cons:
- All services (most of them) should have that code neccesary to authenticate the user.
- The most important: the example of get a user banned.
  i.e.: ASsume user tries to purchase a ticket. He can, the service of purchasing a ticket is aware of authenticating the user. But what happend if that same user gets banned in some point on the future? That logic would be take care by the auth service, updating the access that user has { username: 'Bad person', isBanned: true }. The services that per se authenticate the users, would not know this change. They wont know if that user is banned. The JWT/Cookie that the user had to authenticate (Remember: which is provided by the service used and not auth service) is still VALID! PROBLEM

Handle expiration time for the JWT. When the JWT will have its age too so when the user made a requests, inside the service where the request its been made, that service should ask whether that JWT is expired or not. If it is expired, ways of procceding:

1. Sync request to auth service to refresh token
2. Ask the client to get the token (this means, redirect to login and login)
3. Expiratiom + cache + event bus
   Now, assume that the expiraiton is 15 minutes
   How do we deal with that banned user in that window of 15 minutes? Maybe the user was banned before the JWT expired.FOr this, we could make an async betwenn services implementation. An event bus implementation.
   We can create an event whenever we want to update that JWT (for example is a user is banned, create an event called: { type: 'UserBanned', useId: 'id' }). This event goes to each of our services and inside them we can persist the data inside a cache, and give it life for the same period of time that the jwt will expire.

## Cookies vs JWT

### Cookies

You put your credentials, they go to the server and if it validate your person, it will create a session id as a cookie. That session id is randomly generated and is not readable by other webs.
If you logout the session id is delete from the server and the browser and as long you interact with that page and are active (assuming it does not expire), the server will mantain that session id.
The cookie is only a transport mechanism to transport the sessionId

- Transport mechanism
- Moves any kind of data between browser and server
- Automatically managed by the browser

### JWT's

Stored info in the client and sign it. One holding the signature of the token can validate that
The token is like a randomly generated password. Instead of givin your username or password, you can give the token insted of username or password. The token CONTAINS information about a certain request.

- Authentication/Authorization mechanism
- Stores any data we want
- We have to manage it manually

### Requirements on the Auth mechanism on our app:

In this app, we need to store information inside that piece of information (cookie / JWT). Not only the app must say to us "yes, this user is authenticated" but also give us some data about them "yes, he is not banned and can buy tickets"

Not onlt details about a user but only handle authorization info

The auth mechanism also must have sine built-in, super secure way of expiring after a period of time (related when talked about pros and cons of both)

In microservices, the auth mechanism must be easily understood by many languages.

Our app also implies that the auth mecanism should0t require some kind of backing data store on the server.
We should have only a Store machism to only store the auth mechanism we select. Maybe a service does not have a way to store data (not a mongo DB, sql, redis, nothing so it should need that DB instance to store that auth mechanism)

### So which one?

JWT.
More in favor for JWT: it has expiration
Cookie also "has" an expiration date, but is is managed by the browser. A user could easily copy the cookie and used it at some point ahead of time, no matter the expiration time.

## App + Auth Flow

Browser <--> Normal React app
-> GET Request ticketing.dev ->
<- Response HTML files + script tags <-

-> GET Request JS files ->
<- Response JS files <-

Browser <--> Orders Service (express + express-validator)
-> Request Some data ->
<- Response Orders Data <-

The sonnest we need to authenticate users, is when the users start requesting some data. In this case, the orders service now.

In this app, we have:

Browser <- -> client (next js) <--> Services
We request ticketing.dev to some backend server (nextjs), will build the html for our app with all the content.
That backend sends the response, and the browser client won't need to ask for js files anymore.
As the client next js send everything processed, will also have to fetch some data, this incudes whatever services and as it should request data, it also will need to authenticate the user.
THIS IS A PROBLEM, because when we write down the url google.com, google has no ability to run any js code before sending the html file. It first sends the html file, and then will reach out for those JS sources. We can not customize that header request, that ifrst request. We can not intercept that request and write an autorization header and neither a body. We can only set a cookie to say to the server what user we are. This is the approach we will use, we will save the JWT inside the cookie.

Summing up: as soon as we make aGET request to ticketing.dev, we should have the user authenticate, and the JWT we decide to use as an authentication method can not be placed inside that first request. That request can not run any JS code. The only way to send the JWT is to send it inside cookie.

## Cookies and Encryption

We are going to use cookie-session as a library.
This library enables encryption.

Cookies are difficult to handle among services.
When we decide to encrypt cookies and use multiple services, it can get tricky the unencryption of those cookies. This is the reason that we are not going to encrypt the cookie as the JWT will naturally will prevent from manipulation, JWT are tamper resistant (resistance to tampering === intentional malfunction or sabotage).

## Fix cookie-session library

Update code inside the file in order to make property isNew writable:

.\auth\node_modules\cookie-session\index.js,

```
line 141
Object.defineProperty(this, 'isNew', {
   writable: true,
   value: !obj
})
```

## Cookie / JWT decoding

After setting the cookie inside the request like in previous request, we can see (in postman for example) the process using postman for example, making a post request to https://ticketing.dev/api/users/signup
The request will be something like this :
In cookie tab
value: eyJpc0NoYW5nZWQiOnRydWUsImlzUG9wdWxhdGVkIjp0cnVlLCJqd3QiOiJleUpoYkdjaU9pSklVekkxTmlJc0luUjVjQ0k2SWtwWFZDSjkuZXlKcFpDSTZJalZsWkRkbU5XWmxPV1JqTjJObE1ERXhaV016TXpFeFlTSXNJbVZ0WVdsc0lqb2lkR1Z6ZERWQWRHVnpkQzVqYjIwaUxDSnBZWFFpT2pFMU9URXlNVEUxTVRoOS5kNTZDcGdiSXZNT2ZGdDFrUG1ndzBRMnlUTjZWRXlHcGtsMFlXMTBTcVhzIn0

That session object created in the request, was turn into json and then hash-64 encoded.
To decode it place that cookie inside the url

The return value is the json object passed to the sign objectfunction
{"isChanged":true,"isPopulated":true,"jwt":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlZDdmNWZlOWRjN2NlMDExZWMzMzExYSIsImVtYWlsIjoidGVzdDVAdGVzdC5jb20iLCJpYXQiOjE1OTEyMTE1MTh9.d56CpgbIvMOfFt1kPmgw0Q2yTN6VEyGpkl0YW10SqXs"}

There is our token:
to decode the token, go to jwt.io, paste there jwt and the secret key
The tool that let you play with jwt and decoding them, does not require that key to show the payload, in our case the id and email of the user. The key is meant to be a secure passage to assure ourselves that the sign of the jwt is correct and no user messed around with it. It only checks if the SIGNATURE of the JWT is valid, it DOES NOT hide the payload. This is why is not a good idea to put sensitive information in there.

IT is COMPLETELY neccesary to extract that key, store it in a secure way and share it among all other services because they will need it to verified the signature of the token when they received each request.
