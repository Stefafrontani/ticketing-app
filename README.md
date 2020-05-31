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
