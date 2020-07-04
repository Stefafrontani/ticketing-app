import request from "supertest";
import { app } from "../../app";

it("responds with details about the current user", async () => {
  // Until now, the browser and postman handle the cookie automatically, send cookie data with every following request passing it down through the different request once yo got one. In this tests, we use supertest who does not handle cookies automatically, so we signed up, get a cookie but does not attach it with the second request
  // So we have to get it from the first request, and set it manually into the second one
  const cookie = await global.signin();

  const response = await request(app)
    .get("/api/users/currentuser")
    .set("Cookie", cookie)
    .send()
    .expect(200);

  expect(response.body.currentUser.email).toEqual("test@test.com");
});

it("responds with null if not authenticated", async () => {
  // We do not get the gookie and called global.signin because we want to test the currentUSer null

  const response = await request(app)
    .get("/api/users/currentuser")
    .send()
    .expect(401);

  expect(response.body.currentUser).toEqual(null);
});
