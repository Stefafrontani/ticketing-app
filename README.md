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
  email    : string,
  password : string
}
Ticket : Object = {
  title   : string,
  price   : number,
  userId  : Reference User
  orderId : Reference Order
}
Order : Object = {
  userId    : Reference User,
  status    : Created | Cancelled | AwaitingPayment | Completed,
  ticketId  : Reference Ticket,
  expiresAt : Data
}
Charge : Object = {
  orderId        : Reference Order,
  status         : Created | Failed | Completed,
  amount         : number,
  stripeId       : string,
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
User related   -> USerCreated       UserUpdated
Ticket related -> TicketCreated     TicketUpdated
Order related  -> OrderCreated      OrderCancelled     OrderExpired
Charge related -> ChargeCreated

Architecture
                              _ _ _ _ _ _ _ _ _ _ _           _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _            _ _ _ _ _ _ _ _ _ _ _
                             |                     |         |                 AUTH                 |         |                     |
                             |                     |         |_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ |         |                     |
                             |                     |         |    _ _ _ _ _ _ _     _ _ _ _ _ _     |         |                     |
                             |                     |<--------|   |    NODE     |-->|   MONGODB  |   |-------->|                     |
                             |                     |         |   |_ _ _ _ _ _  |   |_ _ _ _ _ _ |   |         |                     |
                             |                     |         |_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ |         |                     |
                             |                     |                                                          |                     |
                             |                     |          _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _           |                     |
                             |                     |         |                TICKETS               |         |                     |
                             |                     |         |_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ |         |                     |
                             |                     |         |    _ _ _ _ _ _ _     _ _ _ _ _ _     |         |                     |
                             |                     |<--------|   |    NODE     |-->|   MONGODB  |   |-------->|                     |
                             |                     |         |   |_ _ _ _ _ _  |   |_ _ _ _ _ _ |   |         |                     |
                             |                     |         |_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ |         |                     |
                             |                     |                                                          |                     |
                             |                     |          _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _           |                     |
 _ _ _ _ _ _ _               |       COMMON        |         |                ORDERS                |         |       NATS          |
|    Client    |             |                     |         |_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ |         |     STREAMING       |
|   _ _ _ _    |             |      (MODULE        |         |    _ _ _ _ _ _ _     _ _ _ _ _ _     |         |      SERVER         |
|  | NextJS |  |             |    MENTION ABOVE)   |<--------|   |    NODE     |-->|   MONGODB  |   |-------->|   (event bus with   |
|  |_ _ _ _ |  |             |      USED AMONG     |         |   |_ _ _ _ _ _  |   |_ _ _ _ _ _ |   |         | !== implementation) |
|_ _ _ _ _ _ _ |             |     ALL SERVICES    |         |_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ |         |                     |
                             |                     |                                                          |                     |
                             |                     |          _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _           |                     |
                             |                     |         |               PAYMENTS               |         |                     |
                             |                     |         |_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ |         |                     |
                             |                     |         |    _ _ _ _ _ _ _     _ _ _ _ _ _     |         |                     |
                             |                     |<--------|   |    NODE     |-->|   MONGODB  |   |-------->|                     |
                             |                     |         |   |_ _ _ _ _ _  |   |_ _ _ _ _ _ |   |         |                     |
                             |                     |         |_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ |         |                     |
                             |                     |                                                          |                     |
                             |                     |          _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _           |                     |
                             |                     |         |              EXPIRATION              |         |                     |
                             |                     |         |_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ |         |                     |
                             |                     |         |    _ _ _ _ _ _ _     _ _ _ _ _ _ _   |         |                     |
                             |                     |<--------|   |    NODE     |-->|    Redis!    | |-------->|                     |
                             |                     |         |   |_ _ _ _ _ _  |   |_ _ _ _ _ _ _ | |         |                     |
                             | _ _ _ _ _ _ _ _ _ _ |         |_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ |         |_ _ _ _ _ _ _ _ _ _  |
