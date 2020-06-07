import request from "supertest";
import { app } from "../../app";

it("responds with details about the current user", async () => {
  const authResponse = await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "password",
    })
    .expect(201);

  // Until now, the browser and postman handle the cookie automatically, send cookie data with every following request passing it down through the different request once yo got one. In this tests, we use supertest who does not handle cookies automatically, so we signed up, get a cookie but does not attach it with the second request

  // So we have to get it from the first request, and set it manually into the second one
  const cookie = authResponse.get("Set-Cookie");

  const response = await request(app)
    .get("/api/users/currentuser")
    .set("Cookie", cookie)
    .send()
    .expect(200);

  expect(response.body.currentUser.email).toEqual("test@test.com");
});
