import request from "supertest";
import { app } from "../../app";

it("returns a 404 if the ticket is not found", async () => {
  // This test fails unexpectedly - 400 instead of 404 - The error is because we are sending an id to the api/tickets/:id that does not match the mongoose id structure
  await request(app).get("/api/tickets/validticketid").send().expect(404);
});

it("returns the ticket if the ticket is found", async () => {
  const title = "Valid ticket title";
  const price = 20;

  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({
      title,
      price,
    });
  expect(201);

  const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send()
    .expect(200);

  expect(ticketResponse.body.title).toEqual(title);
  expect(ticketResponse.body.price).toEqual(price);
});