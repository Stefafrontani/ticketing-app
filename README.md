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

## Secret - Sharing confidential information among our cluster

Inside our cluster, we have a node, which have all of our pods. Those pods require to know which is the secret key. For this, we will create another object inside the cluster called a secret, that is an object, just like everything in kubernetes kubernetes. A service is an object, a deployment is an object, etc.
Inside a secret we can store key value pairs of information.
We could save something like:
JWT_Key = 'asdf';

This will exposed as an environment variables. The environment variables are inside the containers, not inside the pods itself but whatever... the idea is that we could access those env variables from our services.

### Creating a Secret

In order to declaring a secret there are two approaches:

Declarative:
AS we have done with every other object, created with a config file .yaml

Imperative
Run
\$ kubectl create secret generic jwt-secret --from-literal=jwt=asdf

The reason for this is to not have a config file listing our secrets values although it can be done with a secure approach and give those values with local environment variables.

To delete run:
kubectl delete secret secretName "access-token" deleted

When you create a secret with a specific key and you try to return a different key in the .yaml file, kubernetes will not deploy that thing that used the secret key that does not exist.
To debug the container/pod that did not run, run:
kubectl describe pod {namePod}

## toJSON override behaiour

When JSON.stringify is called, JS will try to invoke a toJSON method inside the objct trying to be converted to JSON

```
const person = { name: 'alex' };
JSON.stringify(person) // Output: "{"name":"alex" }"

const personTwo = { name: 'alex', toJSON() { return 1 } };
JSON.stringify(personTwo) // Output: 1 - Now 1 would be our JSON representation of out personTwo object
```

In a similar way, we can change the behaviour of how mongoose convert documents and give us those return values from the DB. From documents to JSON.
Passing down another argument to mongoose.schema, like in code.

## ts-ignore

To ignore ts errors, write // @ts-ignore above the line you want to be ignored.
See file ./ticketing-app/auth/src/routes/signup.ts

## Common request validator middleware

The router we are using to define the different routes has the structure of

```
router.METHOD(path, [callback, ...] callback)
```

This means it can take as many clalbacks as we want, everytime separating them with a comma or putting all together isndie an array - In the app we do this to put together related-middlewares, for example the express-validator body validators.

When a middleware does not end the request and send a response, we should call next to call the next middleware on the chain.

## Why currentUser handler?

At some point in time React app must know if whether a user is log in or not in our application. But it wont be able to look directly at the cookie and decide if it contains a valid cookie inside. We make that cookie in a way they can not be accessed with JS code inside the browser.
This is why the react app must do a request to a router (currentUser) to see if the user is logged in. That request includes a cookie if that user exist. If the user has no cookie, it wont have a cookie.

So in this router, we have to check if the user has a req.session.jwt.

## Cookies in postman

Below the send button there is a cookir tab. Open it and remove the cookie.
Whenever a request is sent through a domain (ticketing.dev) and a cookie is set, postman will keep that cookie to whatever request we do from the same domain.
So if a cookie was set when POST - api/users/signin, when we send a GET - api/users/currentUser will have that cookie

## Augmenting Type Definitions

When we try to add .currentUser prop inside the req object, TS will complain because, as defined inside the namespace express, it does not accept that property. To augment the props on the req object, we call that inside the global module, inside the express namespace, the request interface can have another prop currentUser

```
declare global {
  // We tell TS that search in the express module
  namespace Express {
    // That interface Request can have currentUser
    interface Request {
      currentUser?: UserPayload;
    }
  }
}
```

# 10 - Testing

## Scope of testing

Several scopes

Test a single piece of code in isolation
Single middleware
i.e.: requireAuth, a function used as a middleware

How several pieces of code work together
Request flowing through multiple middlewares to a request handler
i.e.: requireAuth + signup

How multiple components work together
AuthService interaction with other modules such as our mongoDB
i.e.: order service + mongoDB instance

Different services work together
Use specific server and received that data by other service and process the right way.
i.e.: orders service + ticketing service
This should have an environmentin order to make it testable. Not gonna do this

## Testing Goals - on this app

1. We are focusing on testing services in isolation
   No interaction with other services.
   i..e: If we signup, that request should be processed the correct way.

2. Tests around models - individual modules (1/4 of above)

3. Emitting and Receiving events. We are going to achieve a "test" between services

The tests are going to be run on local machine. No docker used. This imply that our local environment is capable of running each service. In this case is ok, but we can have many dependencies so it can get a little tricky in bigger projects.

## Tests tools

Jest - test runner
Run: \$ npm run test
This will tell jest to:

- In memory copy of MongoDB
- Start up our express app
- Use supertest library to make fake requests to our express app
- Run assertions to make sure the request did the right thing

The supertest library needs the express app to make request to it.
Our current setup, inside the idnex.ts file, not only we create the express server, but also other things like listening to a port. In the future we might want to run different tests at the same time, and that will not be possible because both services will be listening to the same port.
We are going to trust the supertest library behaviour that will take a random port on our computer and make the express app to lsiten to that port, this port is selPected randomly whenever the express app passed to the library is not listening to any port
We will do a refactor - We will have the index.ts and another app.ts file. The app will create the express app, and will not be listening to any port, index.ts will make that app to listen to a port
So app.ts will be used inside both files: test files and index.js

## Testing Dependencies

### mongodb-memory-server

Tihs enables to run run in memory, copy in memoory to test multiple DB at the same time.
If not we would have the same connection to the same instance in mongoDB to run all the tests

As this library has huge size, we should tell the dockerfile inside the infrastructure directory to not take into account the modules placed in as dev dependencies (jest, supertest, etc) as we wont be running tests with docker
This is the magic line inside the docker file
RUN npm install --only=prod

Will not take the dev-dependencies into account

## Script

jest --watch-all --no-cache
--watch-all: run tests wheever a file inside directory is changed
--no-cache: ti fix some issues between ts and jest. Jest does not support ts by nature, so sometimes it does not get its changes perfect.
jest gets really confused sometimes when changing those TS files

## Jest Configuration

```
"jest": {
   "preset": "ts-jest",            // compatibility between jest and ts
   "testEnvironment": "node",      // Bla.
   "setupFilesAfterEnv": [         // Take some files when initializing
      "./src/test/setup.ts"
   ]
}
```

## Convention

If we are testing a file called fileName.ts, jest will look inside that dircectory for the file with the same name, under the `__test__` directory
`/__test__/fileName.test.ts`
Check the extension also

## Issue with process.env

This was brought by the secret container / pod we create in docker and kubernets. We have to hardoced in the setup file

# 11 - Integrating a Server-Side-Rendered React App

## Docker

We create a dockerfile to create an image of the client directory, the client app

Then we test the dockerfile and dockerignore with
\$ docker build -t stefanofrontani/client .

And then we do a push to docker
\$ docker push stefanofrontani/client

## Making client to run on the cloud

We have to configure

1. client-depl.yaml
   To create the deployment for the pod and the service cluster ip (if not specified) to connect to that container

2. skaffold.yaml
   For it to watch changes inside the client directory

3. Configure ingress-srv.yaml
   To tell ingress nginx to route to the correct route
   Note: This is sequentially. nginx will go from top to bottom inside the paths array and will try to march each route in order. The regexp on the client route will cath everything, that's why it is the last on the array. (- path: /?(.\*))

## Problems with reflecting code changes:

### next.config.js

Automatically loaded up by nextjs whenever the app starts up. Next reads this, locate the middleware function and will call it with the default configuration with our update done in that file
Basically, what it does, it will pulled every file every 300 ms.

### The definitive solution if not changes reflected:

List our pods
\$ kubectl get pods

Get the podname of the pod we have to get changes from
name structure: client-depl-whateverinhere

Kill it manually
kubectl delete pod client-depl-whateverinhere

## Communication between services

First, we've got nginx ingress service for an intial routing that routes the request, then the request gets redirected to a cluster ip, and from there the request goes finally to the pod, our cotainer, the express service

## Axios

For client http request.

## Client - NextJS

Incoming GET ticketing.dev
NextJS will then:

- Inspect URL of that request. Determine set of components to show
- Call those components with the static method 'getInitialProps'
- Render each component with data from 'getInitialProps' one time
- Assemble HTML from all components, send back response

## Fetch data with nextjs - getInitialProps

Whenever we want to fetch some data with nextjs during the server side render process, we must implement the method getInitialProps on the component.
We can not allow to fetch some data from inside of the component during the SSR process

## Issue when fetching data in getInitialProps

GET :: await axios.get('/api/users/currentuser')

```
(1)
LandingPage.getInitialProps = () => {
  const response = await axios.get('/api/users/currentuser') // (*diff)

  return response.data;
};
```

```
const LandingPage = ({ currentUser }) => {
  const response = await axios.get('/api/users/currentuser') // (*diff)

  return <h1>Home page</h1>;
};
```

We can not make the request like this in the server side - error: connect ECONNREFUSED 127.0.0.1:80

### Process when request Browser vs Server

#### Request from browser, in the client (1)

[client ] GET ticketing.dev -> [our computer] GET 127.0.0.1:80 (file hosts, trick computer) -> [ingress nginx] Receives an route it appropiately to our -> [client nextjs]

Came back:
[client / browser] <- A fully rendered HTML file with content

Browser
React + axios -> POST /api/users/currentuser (browser will add automatically the domain !!! and attach ticketing.dev/api/users/currentuser) -> [Computer ] -> POST 127.0.0.1:80/api/users/currentuser -> [ingress nginx] GET /api/users/currentuser [auth service]

#### Request from Server Side, in the client (2)

It's almost all the same
The difference is that when nextjs executes getInitialProps and make the get request to explicitly '/api/users/currentuser', as it is being executed in the server, the node http lawer will behave somehow similar to the browser. If not domanin passed down to the url in the request, node will add the local host 127.0.0.1:80. The problem is that the localhost that ist rying to reach, is the localhost OF THE CONTAINER!!! And there is nothing running on localhost:80 that's why the nasty error message of ERRORREFUSED, there's nothing there. That last request is not being catch by the ingress nginx and redirected to anywhere

## Solutions when fetching data in getInitialProps

1. Give the exact path tp the url and don't let node http lawer to add localhost:80.
   This would be to make a request exactly to http://auth-srv/api/users/currentuser

This is not that cool because we would need to know the name of that service and it would be hardcoded for every request we do on SSR

2. Send the request to ingress nginx and let him decide where to route it. This is GOOD.
   Potential issue: when we deal with requests in the server, it doesn't care about the cookie at all so we will have to manage it with some manual process

## Cross NAmespace Service Communication - Access to Ingress nignx

### From the browser- local machine:

We go to localhost (ticketing.dev, port 80 - tricked by the hosts file remember)

### From the pod

To try to access ingress nginx from a container - pod, its a bit different.
Whenever we try to reach a service from a different service we make the request with the specified service name we want to request: http://auth-srv/api/users/... Remember this used clusterIp services between the services
This is enable because both belongs to the same namespace, in this case - auth-srv and client
We can see namepsace names with the command:
kubectl get namespace
The namespace of the ingress-nginx when running the command is 'ingress-nginx' namespace
We should access to the ingress-srv
http://NAMEOFSERICE.NAMESPACE.svc.cluster.local

For this, we have to get, not only the namespace of ingress-nginx, but also the service running inside of if:
\$ kubectl get services
Will show only the services of the default namespace

\$ kubectl get services -n ingress-nginx
Output: table with 2 rows. We will use ingress-nginx-controller this services

So:
http://ingress-nginx-controller.ingress-nginx.svc.cluster.local/api/users/currentuser

## getInitialProps - Where is it called ?

In both, server and client
In the server:

- Hard refresh on page
- Clicking from different domain
- Typing url into address bar

In the client

- Navigation from one page to another while in the app

We will have to add the domain only when needed, when getInitialProps is called in the Server Side

## 403 - Forbidden unauthorized

Not an nginx issue issue but notes were taken anyways

### Ingress

Ingress: resource of kubernets that let us configure an http load balancer for apps running on kubernetes. Represented by 1 or more services.

Load Balancer: hardware (physical or virtual) that works as a reverse proxy to distribute network and/or redirect traffic across diferent servers.

Proxy (forward proxy): Intermediate between client (and their requests) and different servers.
The client directs the request to the proxy server, which evaluates the request and performs the required network transactions. Potentially masking the true origin of the request to the resource server.

Reverse proxy: Same architecture patter.

Differences proxies
Difference subtle between proxy and reverse proxy. The proxy (non reverse) sits right after the client and their requests, its inside their netword edge (the limit where the device or local network starts reaching out to the "INTERNET"). A reverse proxy sits right after that edge network, that is: next to those origin services the client wants to communicate
Ensures that no origin server ever communicates directly with that specific client
Sits in front of an origin server and ensures that no client ever communicates directly with that origin server.

Forward proxy
Client -> Reverse Proxy -> Internet -> Server

Reverse proxy:
Client -> Internet -> Reverse Proxy -> Server

### Ingress controller

It is the application that runs inside a kubernetes cluster and configures that http load balancer acording to the ingress resource
This is deployed in a pod along with the load balancer

## getInitialProps - AppComponent (\_app) vs other common react component

When calling getInitialProps from a common component we have an argument "context = { req, res }"
When we used that function inside an AppComponent inside \_app.js file, the argument passed to that function is
context = { AppTree, Commponent, router, ctx: { req, res } }
We move the getInitialProps called to inside the \_app.js file, inside the AppComponent because we need to know if a user is logged in not only where it was placed before (pages/index.ts)

### Issue with getInitialProps in \_app.js

When calling getInitialProps inside the global \_app.js HOC, the specific getIniitalProps on the other components are not called

From the commit: console.log('landing page'); is not being called.

### Solution for the getInitialProps

Called manually the getInitialProps function for the Component received as prop.

## Signout

When we try to logout we have to request to the auth api/users/signout service.
The request must be coming from inside our component (from browsers) - Not getInitialProps (from server). The server does not know what to do with any cookie.
The response in that service is to reset user session on the request:

```
   req.session = null;
```

We are gonna send back a cookie.

Whenever we make a request from the getInitialProps in the server, if any cookie gets return to us, we are not going to make anything with it whatsoever. We need to make sure that this request comes from the user browser, it will handle cookies.

## Sharing logig between services

We have to use the same code (errors, some middlewares for authentication, etc) in different services
There are many ways to do that, here are 3 ways:

1. Copy paste code
2. Create a git submodule (a repo by itself that will be clone inside every service that needs it)
3. Create a npm module and publish it inside npm registry

### NPM registry

There are 3 diff ways to publish your module
Public:
---For everyone
---For organization

Private:
---For youself.
------payed, only you can access this module
---For the company only

We are going to use the public company so we created a npmjs organization call sfticketing
The module created is called `common`.

#### Publishing in npm registry

```
{
   "name": "@sgticketing/common", // publish common inside sgticketing organization
   "version": "1.0.0",
   "description": "",
   "main": "./build/index.js", // the file wher eit will take whenever an import is made to the module import module from '@sfticketing/common'
   "types": "./build/index.d.ts", // Types - used by ts
   "files": [ // Every file that gets include on the final version of our package
     "build/**/*"
  ],
   "scripts": {
     "clean": "del build", // Clean the build directory
     "build": "npm run clean && tsc" // Clean before build
         "pub": "git add . && git commit -m \"Updates\" && npm version patch && npm run build && npm publish"
 // Publish git after: a fresh commit, increase version, remove build, rebuild build and publish
   },
   "keywords": [],
   "author": "",
   "license": "ISC",
   "devDependencies": {
     "del-cli": "^3.0.1",
     "typescript": "^3.9.5"
  }
}

```

Commands
Initial publish
\$ npm publish --access public

For 403 problems when running publish command
\$ npm login
-- Username: stefanofrontani
-- password:

For publishing every change:
\$ npm npm version patch (from 1.0.0 -> 1.0.1)

\$ npm run build

\$ npm publish

#### Installing common module

We remove all the code that is going to be shared - dirs:
auth/errors
auth/middlewares

We have to install the common module

For last, we have to update import statements

## Updating version:

Inside common directory:
\$ npm run pub

Inside the service to update common: (/auth for example)
\$ npm update @sfticketing/common

OPTIONALLY
Once update executes, we can:

Inspect the pods to see if the pod of that service was updated:
kubectl get pods
get name

Run the shell of that container to see the files inside (and check updated version of common module)
kubectl exec -it {podname} sh

Redirect to:
/app # //HERE WRITE COMMANDS
Commands: cd node_modules/@sfticketing/common
cat package.json (and check package file common module version)

## Create-Read-Update-Destroy Server Setup (Section 13)

### Initial setup

1. We copy paste these files from auth, changing auth specific names for tickets one
2. Build the image for tickets service and push it to the hub. Why? When we run skaffold, skaffold go to docker hub and pulled images from the hub, that's why we have to push it there.
   Buiild image: docker build -t stefanofrontani/tickets .
   Push image: docker push stefanofrontani/tickets
3. Create deployment and service
4. Update skaffold.yaml file
5. Create mongoDB deployment and service

### Mongo Connection URI

We hardodoe inside the tickets-srv deployment file an environment variable that will hold the mongo uri.

This is not a problem because the only way to connect to that service (tickets-mongo-srv) is inside the cluster. No problem at all.

### Test first approach

Run tests with:
\$ npm run test

## Adding auth protection

We have to use the currentUser and requireAuth middlewares
Reminder:
currentUser middleware:
only search for the jwt inside the req.session object. If it finds it, the middleware attach currentUSer prop to the request object.

requireAuth:
throws the error (/_ commented _/) if the req.currentUser is not in the request

## Faking authentication During Tests

Cookis structure:
express:sess=
eyJqd3QiOiJleUpoYkdjaU9pSklVekkxTmlJc0luUjVjQ0k2SWtwWFZDSjkuZXlKcFpDSTZJalZsWlRVeU56Rm1ZMk01WkdOaU1EQXhPR0U0TW1FelpDSXNJbVZ0WVdsc0lqb2lkR1Z6ZEVCMFpYTjBMbU52YlNJc0ltbGhkQ0k2TVRVNU1qQTNOakEyTTMwLm9ueWVCbzdXMTU5Tml6bUxlVFQ1VTRhRVdoWFczLWlWbmZsWThJTk4tOTQifQ==

In the auth service, we create a fake function called signin, and we attach it to the global namespace.
In that function we create a cookie sending a request to /api/users/signup, extract that cookie in the response header and return it

In the tickets service, we no longer have the /apu/users/signup router to called in order to get a cookie. So we have to create ourselves

So we remove everything inside that signin function and let comment the steps of what we should do to create that cookie.

## Building a session

The cookie construction mentioned above is

## Reminder on mongoose with typescript

We have 3 different interfaces when dealig with mongoose with typescript

// Attributes that the build function should received
interface TicketAttrs {}

// Properties that a document will have, mongoose will add some besides the Attrs above (createdAt for example)
interface TicketDoc {}

// Define the build function inside in order to have a validation on the attributes we should pass to the ticket model when we create a ticket.
interface TicketModel {}

## NATS Streaming Server - An Event Bus Implementation (Section 14)

We configure a nats streaming server - deployment (for the pod) and a service (to communication) as always.
New things:
args:
When skaffold reads the files and creates these objects it runs commands. We can have arguments to use in those commands, that is the function of this:

```
containers:
- name: nats
   image: nats-streaming:0.17.0
   args:
   [
      "-p", // port to connect to the pod
      "4222",
      "-m", // Port to connect to the monitoring api (inside localhost:8222/streaming) - More in nats-streaming-server repo
      "8222",
      "-hbi", // heart beat: a little request that nats streaming server send to its clients. Serves as a help-check and see if they are still runinng. hbi sets the time between those heartbeat requests
      "5s",
      "-hbt", // how long each client has to respond
      "5s",
      "-hbf", // how many times a client can fail in their response before nats removing that client from the clients array list
      "2",
      "-SD",
      "-cid",
      "ticketing",
   ]
```

NATS Streaming server - Creating nats deployment & service - (263)

## Connecting to NATS in a Node JS World (Section 15)

Everything is inside the nats-streaming-server repo. IT has a readme with an exaplanation of the nats streaming server basic functionality as well as almost all the code we end up pasting here.

## Managing a NATS Client (Section 16)

We start implementing the nats stremaing server inside this project. The first thing was to copy paste the code: commit's hash: 8ebad701dd025a9fac695111da28ca58be889c26 - NATS Streaming Server - Updating common module with listener and publishercode from nats-streaming-server project - (298)

After that, we created a publisher for the ticket-created-publisher but before we can use it new specific ticket created publisher

```
new TicketCreatedPublisher(client).publish({ ticket })
```

For this to work, we have to passed down a client. The problem is that we want to mantain the client through all of the app, such as mongoose does: mongoose exports from its module 'mongoose' as an instance of what could be a Mongoose Class. Every tyime you import mongoose inside a module, you then have access to that same instance that was initially connected to a db inside an index.ts.

We have to do something similar with the nats streaming server. We should have a class NatsWrapper, instantiate that and export that instance, so that we can use that same instance inside eery file inside our client. This is to prevent a cyclic dependency (Between the index.ts [where the nats-streaming-server connection should happen], and the others files were we need that same connection [ tickets/routes/new.ts ] for example)

For this we use a singleton implementation - see nats-wrapper.ts.

After doing this, we then can import that natsWrapper instance inside other files, such as new.ts. In that file we call TicketCreatedPublisher to publish that new ticket created, passing down the natsWrapper.client to that.

Add to commit: Finally: We are doing the close and exit thing. We lsiten for close event (when closing the nats server) and as a callback,, in a main file, we can kill the process. (We could put the following code inside NatsWrapper class (nats-wrapper.ts) but its kinda weird that a class exit a while programm process.

```
    natsWrapper.client.on("close", () => {
      console.log("NATS connection closed!");
      process.exit();
    });
    process.on("SIGINT", () => natsWrapper.client.close());
    process.on("SIGTERM", () => natsWrapper.client.close());
```

Test listener:
go to ticketing-app dir
In order to run the create a nats deployment
\$ skaffold dev

Inside the nats-streaming-server repo
Then create a port to enable connection to that deployment from the outside
\$ npm run listen
Remember that that listener, listens on the 4222, on localhost

Go to postman and create a ticket (you must have a cookie so signup and / login first) - Post to https://ticketing.dev/api/users/signup and then to https://ticketing.dev/api/tickets

### Data integrity issues

Imagine this:

Inside transactions service

```
   await deposit.save();
   <!-- This would be used in accounts service, which tracks the account balance of an user -->
   new TicketUpdatedPublisher(natsWrapper.client).publish(deposit);
```

What happened if we save it correclty but we never send the event so the accounts service can processed it? MAybe NATS streaming server connection failed. Well, then we would have some data inconsistency among two services. How do we solve this?

We save the events in a separate collection inside the same DB of the service that created that new resource (in this case transactions service). So if NATS is down, whenever goes up again, it will ask for those events that has a (NO) value inside a property that will tell whether or not it was sent / published to NATS. (sent prop)

At this point inside the repo, the tests are failing because we do not have a nats client in our test environment. Solution in next commit. We will solve those teste creating a fake connection to that nats server

### Adding NATS connection values as environment variables

The new is this:

- name: NATS_CLIENT_ID
  valueFrom:
  fieldRef:
  fieldPath: metadata.name

We will give the clientId as the name of the pod that is connecting to the NATS SERVER. Those ids of every pod running are unique, so if we want to run several instances of this pod, it will randomly generate new names for those new pods thus giving unique CLIENT_ID to the nats server connection

## Cross-Service Data Replication In Action (Section 17)

### Subtle Service Coupling

When you validate the request with the structure that mongoose use for the ids, you are coupling the tickets service and its DB instance type with the orders service. In the future, the tickets service might used another type of DB that has another id structure.

### Associating Orders and Tickets

Two ways:

1. Embedding:
   order: { userId, status, expiresAt, ticket: wholeTicketInfo }

pros:

- easy to fiugre out what order is for which ticket
  cons:
- querying is a bit challenging. For every order we want to create, we have to see if it has a ticketid equals to the ticket we are looking for creating a new order.
- We do not have a place to put the tickets that are not reserved! The tickets service has them but theyare not accesible after they were created and saved in that service.

2. Ref/Population Feature. From mongoose
   Orders collection
   Tickets collection
   We are using this one.

For the status property inside an order, we created a enum type inside the common repo and update that repo sfticketing/common in this ticketing repo.
We have to created a whole ticket model because we have to indicate what type of ticket will be related to this orders service. MAybe tickets service itself keeps track of the tickets with a whole bunch of properties, but in the orders service (currently working on) we only want some specific tickets properties to be associated with orders.

## Understanding Event Flow (Section 18)

### Orders service events

Remember:
The orders service is aware of the tickets and orders colelctions

Events published by:

Orders service
These events emitted are:

1. order:created - When an order is created.
   This event will go to:

   - tickets service:
     tickets needs to be told that one of its tickets has been reserved, and no further edits to that tickets shoud be allowed
   - payments service:
     tickets needs to know there is a new order that a user might submit a payment for
   - expiration service:
     tickets needs to start a 15 (or whichever) minutes timer to eventually time out this order

2. order:cancelled
   This event will go to:
   - tickets service:
     tickets should unreserve a ticket if the corresponding order has been cancelled so this ticket can be edited again
   - payments service:
     payments should know that any incoming payments for this order should be rejected

Update "updates - 8" inside common module with the new orders events created there - order:created and order:cancelled events. Should have been v 1.0.9 but by mistake pub 2 times and end up being v 1.0.10

## Listening for Events and Handling Concurrency Issues (Section 13)

### Time for listeners

Events published by:

Tickets service
These events emitted are:

1. ticket:created
   Will be listened by:

   - orders service:
     orders needs to know the valid tickets that can be purchased
     orders needs to know the price of each ticket

2. ticket:updated
   Will be listened by:

   - orders service:
     orders needs to know when the price of a ticket has changed
     orders needs to know when a ticket has succesfully been reserved

Payments service
These events emitted are:

1. charge:created.
   Will be listened by:
   - TODO - complete

Expiration service
These events emitted are:

1. expiration:complete.
   Will be listened by:
   - TODO - complete
