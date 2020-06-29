import {
  Subjects,
  Publisher,
  ExpirationCompleteEvent,
} from "@sfticketing/common";

export class ExpirationCompletePublisher extends Publisher<
  ExpirationCompleteEvent
> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}
